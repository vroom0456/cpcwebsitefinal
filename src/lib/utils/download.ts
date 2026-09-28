import JSZip from "jszip";
import type { Photo } from "@/types/database";
import { getPhotoDisplayUrl } from "@/lib/utils";

function saveBlobAs(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.split("/").pop() || filename || "photo.jpg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revocation to ensure browser has processed the download trigger
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 2000);
}

function canvasDownloadFallback(imageUrl: string, filename: string) {
  if (typeof window === "undefined") return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width || 1200;
    canvas.height = img.naturalHeight || img.height || 800;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            saveBlobAs(blob, filename);
          } else {
            // Last resort: trigger direct download link
            const a = document.createElement("a");
            a.href = imageUrl;
            a.download = filename;
            a.target = "_blank";
            a.click();
          }
        },
        "image/jpeg",
        0.95
      );
    }
  };
  img.onerror = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = filename;
    a.target = "_blank";
    a.click();
  };
  img.src = imageUrl;
}

/**
 * Downloads a single photo directly to disk as a Blob file.
 * Never redirects to Google Photos or opens external tabs.
 */
export async function downloadSinglePhoto(photo: Photo) {
  if (!photo) return;
  const cleanFilename = photo.filename.split("/").pop() || photo.filename || "photo.jpg";
  const apiDownloadUrl = `/api/photos/${photo.id || photo.drive_file_id}/download`;

  try {
    const res = await fetch(apiDownloadUrl);
    if (!res.ok) throw new Error(`API download HTTP error: ${res.status}`);
    const blob = await res.blob();
    saveBlobAs(blob, cleanFilename);
  } catch {
    // Fallback: fetch display URL directly
    try {
      const displayUrl = getPhotoDisplayUrl(photo);
      const res = await fetch(displayUrl);
      if (!res.ok) throw new Error("Display URL fetch failed");
      const blob = await res.blob();
      saveBlobAs(blob, cleanFilename);
    } catch {
      // Canvas fallback for cross-origin CORS handling
      canvasDownloadFallback(getPhotoDisplayUrl(photo), cleanFilename);
    }
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

  const downloadTask = async (photo: Photo) => {
    if (signal?.aborted) return;
    try {
      // Deduplicate filenames in the ZIP
      let name = photo.filename.split("/").pop() || photo.filename || "photo.jpg";
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

      // 1. Try API download proxy
      try {
        const apiRes = await fetch(`/api/photos/${photo.id || photo.drive_file_id}/download`, { signal });
        if (apiRes.ok) {
          blob = await apiRes.blob();
        }
      } catch {
        // Continue to fallback
      }

      // 2. Fallback to direct display URL
      if (!blob) {
        const displayUrl = getPhotoDisplayUrl(photo);
        const res = await fetch(displayUrl, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      }

      if (blob) {
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
    throw new Error("All image downloads failed");
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

  saveBlobAs(zipBlob, zipName);
  return { failed };
}
