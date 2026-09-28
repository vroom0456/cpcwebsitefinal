import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractDriveFolderId(input: string | null | undefined): string | null {
  if (!input) return null;
  const str = input.trim();
  const folderMatch = str.match(/folders\/([a-zA-Z0-9_-]{15,})/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];
  const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch && idMatch[1]) return idMatch[1];
  const directMatch = str.match(/^([a-zA-Z0-9_-]{15,})$/);
  if (directMatch && directMatch[1]) return directMatch[1];
  const cleaned = str.split("?")[0]?.split("/").filter(Boolean).pop();
  return cleaned || str;
}

/**
 * Resolve any Google Drive URL variant to a displayable image URL.
 */
export function coverPhotoSrc(url: string | null | undefined, size = 800): string {
  if (!url) return "/images/placeholder-event.jpg";

  // 1. Already an API proxy route
  if (url.startsWith("/api/")) {
    return url;
  }

  // 2. Extract Google Drive file ID if present and use reliable server proxy
  const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/);
  if (driveMatch && driveMatch[1]) {
    return `/api/drive/photo/${driveMatch[1]}`;
  }

  // 3. LH3 direct URL
  if (url.includes("lh3.googleusercontent.com/d/")) {
    const base = url.split("=")[0];
    return `${base}=s${size}`;
  }

  // 4. Fallback for expired drive-storage links or other URLs
  if (url.includes("lh3.googleusercontent.com/drive-storage/")) {
    return "/images/placeholder-event.jpg";
  }

  return url;
}

/**
 * Get the best displayable URL for a photo record.
 */
export function getPhotoDisplayUrl(
  photo: {
    drive_file_id?: string | null;
    full_url?: string | null;
    thumbnail_url?: string | null;
  },
  mode: "thumbnail" | "full" = "thumbnail"
): string {
  const size = mode === "thumbnail" ? 600 : 1800;

  // 1. Server proxy route (100% reliable, zero CORS/hotlink block)
  if (photo.drive_file_id && photo.drive_file_id.length >= 20 && !photo.drive_file_id.startsWith("test-")) {
    return `/api/drive/photo/${photo.drive_file_id}`;
  }

  // 2. Extract Drive File ID from thumbnail_url or full_url if present
  const allUrls = [photo.thumbnail_url, photo.full_url].filter(Boolean) as string[];
  for (const url of allUrls) {
    const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
      return `/api/drive/photo/${match[1]}`;
    }
  }

  // 3. Working HTTP thumbnail_url
  if (
    photo.thumbnail_url &&
    photo.thumbnail_url.startsWith("http") &&
    !photo.thumbnail_url.includes("drive-storage")
  ) {
    return photo.thumbnail_url;
  }

  // 4. Working HTTP full_url
  if (
    photo.full_url &&
    photo.full_url.startsWith("http") &&
    !photo.full_url.includes("drive-storage")
  ) {
    return photo.full_url;
  }

  return "/images/placeholder-event.jpg";
}

/**
 * Strictly format any date string into DD-MM-YYYY (e.g., "23-07-2026").
 * Robust against timezone offsets for YYYY-MM-DD inputs.
 */
export function formatEventDate(dateInput?: string | null): string {
  if (!dateInput) return "01-01-2026";
  const str = String(dateInput).trim();
  
  // YYYY-MM-DD pattern: extract exact calendar numbers without timezone shift
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}-${m}-${y}`;
  }

  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  const parts = str.split(/[-/T ]/);
  if (parts.length >= 3 && parts[0] && parts[1] && parts[2] && parts[0].length === 4) {
    return `${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[0]}`;
  }
  return str;
}

