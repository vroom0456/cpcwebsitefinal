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
    return url.includes("?") ? url : `${url}?sz=${size}`;
  }

  // 2. Extract Google Drive file ID if present and use ultra-fast disk-cached server proxy
  const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/);
  if (driveMatch && driveMatch[1]) {
    return `/api/drive/photo/${driveMatch[1]}?sz=${size}`;
  }

  // 3. LH3 direct URL with size
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
 * Uses high-speed local disk-cached proxy to prevent Google 429 rate-limiting.
 */
export function getPhotoDisplayUrl(
  photo: {
    drive_file_id?: string | null;
    full_url?: string | null;
    thumbnail_url?: string | null;
  },
  mode: "thumbnail" | "full" = "thumbnail"
): string {
  const sz = mode === "thumbnail" ? 800 : 1600;

  // 1. Valid Drive File ID -> High-speed disk-cached proxy
  if (photo.drive_file_id && photo.drive_file_id.length >= 20 && !photo.drive_file_id.startsWith("test-")) {
    return `/api/drive/photo/${photo.drive_file_id}?sz=${sz}`;
  }

  // 2. Extract Drive File ID from thumbnail_url or full_url if present
  const allUrls = [photo.thumbnail_url, photo.full_url].filter(Boolean) as string[];
  for (const url of allUrls) {
    const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
      return `/api/drive/photo/${match[1]}?sz=${sz}`;
    }
  }

  // 3. Working HTTP thumbnail_url (if not drive-storage or lh3)
  if (
    photo.thumbnail_url &&
    photo.thumbnail_url.startsWith("http") &&
    !photo.thumbnail_url.includes("drive-storage") &&
    !photo.thumbnail_url.includes("lh3.googleusercontent.com/d/")
  ) {
    return photo.thumbnail_url;
  }

  // 4. Working HTTP full_url
  if (
    photo.full_url &&
    photo.full_url.startsWith("http") &&
    !photo.full_url.includes("drive-storage") &&
    !photo.full_url.includes("lh3.googleusercontent.com/d/")
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

const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * Formats a date into an editorial photography format, e.g. "15 SEP 2026".
 */
export function formatEditorialDate(dateInput?: string | null): string {
  if (!dateInput) return "2026 ARCHIVE";
  const str = String(dateInput).trim();

  // Match YYYY-MM-DD
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd && ymd[1] && ymd[2] && ymd[3]) {
    const y = ymd[1];
    const m = ymd[2];
    const d = ymd[3];
    const monthIdx = parseInt(m, 10) - 1;
    const monthName = MONTHS_SHORT[monthIdx] || "ARCHIVE";
    return `${d} ${monthName} ${y}`;
  }

  // Match DD-MM-YYYY
  const dmy = str.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy && dmy[1] && dmy[2] && dmy[3]) {
    const d = dmy[1];
    const m = dmy[2];
    const y = dmy[3];
    const monthIdx = parseInt(m, 10) - 1;
    const monthName = MONTHS_SHORT[monthIdx] || "ARCHIVE";
    return `${d} ${monthName} ${y}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const monthName = MONTHS_SHORT[d.getUTCMonth()] || "ARCHIVE";
    const year = d.getUTCFullYear();
    return `${day} ${monthName} ${year}`;
  }

  return str;
}

/**
 * Normalizes raw Google Drive folder strings into clean, editorial event titles.
 * Handles common abbreviations, department names, removes trailing raw dates, and fixes casing.
 */
export function cleanEventTitle(rawTitle: string): string {
  if (!rawTitle) return "Campus Event";
  let t = rawTitle.trim();

  // Remove leading/trailing timestamps or dates like "15-09-2026", "28_04_2026", "2026-09-15"
  t = t.replace(/(?:^|[\s_/-])\d{1,2}[-._/]\d{1,2}[-._/]\d{2,4}(?:$|[\s_/-])/gi, " ");
  t = t.replace(/(?:^|[\s_/-])\d{4}[-._/]\d{1,2}[-._/]\d{1,2}(?:$|[\s_/-])/gi, " ");

  const replacements: [RegExp, string][] = [
    [/\bCOSC\b/gi, "COSC"],
    [/\bDYUTHI\b/gi, "DYUTHI"],
    [/\bCBIT\b/gi, "CBIT"],
    [/\bIEEE\b/gi, "IEEE"],
    [/\bNSS\b/gi, "NSS"],
    [/\bMANUFATURING\b/gi, "Manufacturing"],
    [/\bCOLLABRATION\b/gi, "Collaboration"],
    [/\bTranning Sesions\b/gi, "Training Sessions"],
    [/\bCIVIL DEPT\b/gi, "Civil Engineering Dept"],
    [/\bCHEMICAL DEPT\b/gi, "Chemical Engineering Dept"],
    [/\bMECH DEPT\b/gi, "Mechanical Engineering Dept"],
    [/\bECE DEPT\b/gi, "ECE Dept"],
    [/\bCSE DEPT\b/gi, "CSE Dept"],
    [/\bIT DEPT\b/gi, "IT Dept"],
    [/\bAI[\s_-]?ML\b/gi, "AI & ML"],
    [/\bANNUAL FEST\b/gi, "Annual Fest"],
  ];

  for (const [regex, replacement] of replacements) {
    t = t.replace(regex, replacement);
  }

  t = t.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  // If ALL-CAPS, convert to Title Case except known acronyms
  if (t === t.toUpperCase() && t.length > 4) {
    const acronyms = new Set(["CBIT", "COSC", "DYUTHI", "IEEE", "NSS", "AI", "ML", "ECE", "CSE", "IT", "TEDX", "GDSC", "CPC"]);
    t = t
      .split(" ")
      .map((word) => {
        if (acronyms.has(word.toUpperCase())) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  return t || rawTitle;
}


