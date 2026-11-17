import JSZip from "jszip";
import type { Photo } from "@/types/database";
import { getPhotoDisplayUrl } from "@/lib/utils";

function sanitizeDownloadFilename(name: string): string {
  const clean = name
    .replace(/[\/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_")
    .trim();
  return clean || "photo.jpg";
}

function saveBlobAs(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const safeName = sanitizeDownloadFilename(filename);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.style.position = "fixed";
  a.style.left = "-9999px";
  a.style.top = "-9999px";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) {
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
  }, 4000);
}

/**
 * Downloads a single photo directly to disk.
 * Uses native attachment stream from /api/photos/[photoId]/download.
 * Never redirects to Google Photos, never opens external blank tabs,
 * and supports unlimited repeated downloads without page reload.
 */
export async function downloadSinglePhoto(photo: Photo) {
  if (!photo || typeof window === "undefined") return;

  const targetId = photo.id || photo.drive_file_id;
  if (!targetId) return;

  const cleanFilename = sanitizeDownloadFilename(
    photo.filename?.split("/").pop() || photo.filename || "photo.jpg"
  );

  const downloadEndpoint = `/api/photos/${encodeURIComponent(targetId)}/download?t=${Date.now()}`;

  // Primary mechanism: Native browser download trigger via hidden anchor
  // Content-Disposition: attachment ensures the browser saves the file directly
  // without navigating away, zero CORS restrictions, and zero blob URL memory leaks.
  try {
    const a = document.createElement("a");
    a.href = downloadEndpoint;
    a.download = cleanFilename;
    a.rel = "noopener noreferrer";
    a.style.position = "fixed";
    a.style.left = "-9999px";
    a.style.top = "-9999px";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
    }, 1500);
    return;
  } catch (err) {
    console.warn("Direct anchor download trigger failed, attempting fetch fallback:", err);
  }

  // Secondary fallback: Direct fetch stream to blob
  try {
    const res = await fetch(downloadEndpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const blob = await res.blob();
    saveBlobAs(blob, cleanFilename);
  } catch (err) {
    console.error("Single photo download failed completely:", err);
  }
}

interface ZipDownloadOptions {
  onProgress?: (completed: number, total: number) => void;
  onFileError?: (photo: Photo) => void;
  signal?: AbortSignal;
}

/**
 * Downloads a set of photos as a single ZIP.
 * Processes fetches in parallel chunks of 4 to prevent network congestion
 * and API rate limits.
 */
export async function downloadPhotosAsZip(
  photos: Photo[],
  zipName: string,
  { onProgress, onFileError, signal }: ZipDownloadOptions = {}
) {
  const zip = new JSZip();
  let completed = 0;
  const CONCURRENCY = 4;
  const queue = [...photos];
  const activeDownloads = new Set<Promise<void>>();
  const failed: Photo[] = [];
  const seenFilenames = new Set<string>();

  const safeZipName = zipName.replace(/[\/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_").trim() || "photos.zip";
  const finalZipName = safeZipName.endsWith(".zip") ? safeZipName : `${safeZipName}.zip`;

  const downloadTask = async (photo: Photo) => {
    if (signal?.aborted) return;
    try {
      // Deduplicate filenames in the ZIP
      let rawName = photo.filename.split("/").pop() || photo.filename || "photo.jpg";
      let name = sanitizeDownloadFilename(rawName);
      let counter = 1;
      const dotIndex = name.lastIndexOf(".");
      const base = dotIndex !== -1 ? name.substring(0, dotIndex) : name;
      const ext = dotIndex !== -1 ? name.substring(dotIndex) : ".jpg";
      while (seenFilenames.has(name)) {
        name = `${base}_${counter}${ext}`;
        counter++;
      }
      seenFilenames.add(name);

      let blob: Blob | null = null;
      let fileId = photo.drive_file_id;
      if (!fileId) {
        const match = [photo.thumbnail_url, photo.full_url]
          .filter(Boolean)
          .join(" ")
          .match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/|\/api\/drive\/photo\/)([a-zA-Z0-9_-]{15,})/);
        if (match && match[1]) fileId = match[1];
      }

      // 1. Primary: High-speed disk-cached proxy at 1600px
      const primaryUrl = fileId
        ? `/api/drive/photo/${fileId}?sz=1600`
        : getPhotoDisplayUrl(photo, "full");

      try {
        const res = await fetch(primaryUrl, { signal });
        if (res.ok) {
          const b = await res.blob();
          if (b && b.size > 200) blob = b;
        }
      } catch {}

      // 2. Fallback: API download route
      if (!blob && (photo.id || fileId)) {
        try {
          const apiRes = await fetch(`/api/photos/${photo.id || fileId}/download`, { signal });
          if (apiRes.ok) {
            const b = await apiRes.blob();
            if (b && b.size > 200) blob = b;
          }
        } catch {}
      }

      // 3. Fallback: standard thumbnail proxy
      if (!blob && fileId) {
        try {
          const res = await fetch(`/api/drive/photo/${fileId}?sz=800`, { signal });
          if (res.ok) {
            const b = await res.blob();
            if (b && b.size > 200) blob = b;
          }
        } catch {}
      }

      if (blob && blob.size > 200) {
        zip.file(name, blob);
      } else {
        throw new Error("Could not acquire photo blob");
      }
    } catch (err: any) {
      if (err.name === "AbortError" || signal?.aborted) return;
      failed.push(photo);
      onFileError?.(photo);
    } finally {
      completed += 1;
      onProgress?.(completed, photos.length);
    }
  };

  while (queue.length > 0 && !signal?.aborted) {
    while (activeDownloads.size < CONCURRENCY && queue.length > 0) {
      const nextPhoto = queue.shift()!;
      const promise = downloadTask(nextPhoto).then(() => {
        activeDownloads.delete(promise);
      });
      activeDownloads.add(promise);
    }
    if (activeDownloads.size > 0) {
      await Promise.race(activeDownloads);
    }
  }

  // Wait for all remaining active downloads to complete
  if (activeDownloads.size > 0 && !signal?.aborted) {
    await Promise.all(activeDownloads);
  }

  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

  // If everything failed, abort ZIP generation
  if (completed - failed.length === 0) {
    throw new Error("All image downloads failed. Please check network connection.");
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

  saveBlobAs(zipBlob, finalZipName);
  return { failed };
}
