import JSZip from "jszip";
import type { Photo } from "@/types/database";

export type DownloadVariant = "cpc" | "original";

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export function sanitizeDownloadFilename(name: string): string {
  const clean = name
    .replace(/[\/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, " ")
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
 * Never redirects to external tabs, preserves original filename and extension,
 * embeds lossless CPC attribution metadata by default, and works reliably
 * on both mobile phones (iOS Safari, Android Chrome) and desktop.
 */
export async function downloadSinglePhoto(
  photo: Photo,
  variant: DownloadVariant = "cpc"
) {
  if (!photo || typeof window === "undefined") return;

  const targetId = photo.drive_file_id || photo.id;
  if (!targetId) return;

  const rawFilename = photo.filename?.split("/").pop() || photo.filename || "photo.jpg";
  const cleanFilename = sanitizeDownloadFilename(rawFilename);

  const queryParts = [
    `variant=${variant}`,
    `t=${Date.now()}`,
    photo.drive_file_id ? `drive_id=${encodeURIComponent(photo.drive_file_id)}` : "",
    photo.event_id ? `event=${encodeURIComponent(photo.event_id)}` : "",
    cleanFilename ? `fn=${encodeURIComponent(cleanFilename)}` : "",
  ].filter(Boolean);

  const downloadEndpoint = `/api/photos/${encodeURIComponent(targetId)}/download?${queryParts.join("&")}`;

  // Reliable non-navigating anchor download trigger across both mobile and desktop
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
    }, 2000);
    return;
  } catch (err) {
    console.warn("Direct anchor download trigger failed, attempting fetch fallback:", err);
  }

  // Universal secondary fallback: Direct fetch stream to blob
  try {
    const res = await fetch(downloadEndpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const blob = await res.blob();
    saveBlobAs(blob, cleanFilename);
  } catch (err) {
    console.error("Single photo download failed completely:", err);
  }
}

export interface ZipDownloadOptions {
  variant?: DownloadVariant;
  onProgress?: (completed: number, total: number) => void;
  onFileError?: (photo: Photo) => void;
  signal?: AbortSignal;
}

/**
 * Downloads a set of photos as a single ZIP with original filenames and extensions.
 * Processes fetches in parallel chunks of 3 to avoid mobile memory limits and network saturation.
 */
export async function downloadPhotosAsZip(
  photos: Photo[],
  zipName: string,
  { variant = "cpc", onProgress, onFileError, signal }: ZipDownloadOptions = {}
) {
  const zip = new JSZip();
  let completed = 0;
  const CONCURRENCY = 3;
  const queue = [...photos];
  const activeDownloads = new Set<Promise<void>>();
  const failed: Photo[] = [];
  const seenFilenames = new Set<string>();

  const safeZipName = zipName.replace(/[\/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_").trim() || "photos.zip";
  const finalZipName = safeZipName.endsWith(".zip") ? safeZipName : `${safeZipName}.zip`;

  const downloadTask = async (photo: Photo) => {
    if (signal?.aborted) return;
    try {
      // Preserve original filename and extension
      const rawName = photo.filename.split("/").pop() || photo.filename || "photo.jpg";
      let name = sanitizeDownloadFilename(rawName);

      // Disambiguate duplicate filenames inside the ZIP deterministically
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
      const targetId = photo.drive_file_id || photo.id;

      // 1. Same-origin API download with lossless CPC attribution and original preservation
      if (targetId) {
        try {
          const queryParts = [
            `variant=${variant}`,
            photo.drive_file_id ? `drive_id=${encodeURIComponent(photo.drive_file_id)}` : "",
            photo.event_id ? `event=${encodeURIComponent(photo.event_id)}` : "",
            name ? `fn=${encodeURIComponent(name)}` : "",
          ].filter(Boolean);
          const apiRes = await fetch(`/api/photos/${encodeURIComponent(targetId)}/download?${queryParts.join("&")}`, {
            signal,
            cache: "no-store",
          });
          if (apiRes.ok) {
            const b = await apiRes.blob();
            if (b && b.size > 200) blob = b;
          }
        } catch {}
      }

      // 2. Fallback: direct proxy
      if (!blob && photo.drive_file_id) {
        try {
          const res = await fetch(`/api/drive/photo/${photo.drive_file_id}?sz=1600`, { signal });
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

  if (activeDownloads.size > 0 && !signal?.aborted) {
    await Promise.all(activeDownloads);
  }

  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

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
