import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_GOOGLE_DRIVE_API_KEY } from "@/lib/constants/env-defaults";
import type { Event, Photo } from "@/types/database";

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function extractDriveFolderId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/folders\/([a-zA-Z0-9_-]{20,})/);
  if (match?.[1]) return match[1];
  const fileMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]{20,})/);
  return fileMatch?.[1] ?? null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseDate(dateStr: string) {
  if (!dateStr) return { date: "2026-01-01", month: 1, academicYear: "2025-26" };

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [year, month] = dateStr.trim().split("-");
    const yrNum = parseInt(year!, 10);
    const monthNum = parseInt(month!, 10);
    const academicYear =
      monthNum >= 6
        ? `${yrNum}-${(yrNum + 1).toString().slice(-2)}`
        : `${yrNum - 1}-${year!.slice(-2)}`;
    return {
      date: dateStr.trim(),
      month: monthNum,
      academicYear: ["2024-25", "2025-26", "2026-27"].includes(academicYear)
        ? academicYear
        : "2025-26",
    };
  }

  const parts = dateStr.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    let year = parts[2]!;
    let day = parts[0]!;
    let month = parts[1]!;

    if (parts[0]!.length === 4) {
      year = parts[0]!;
      month = parts[1]!;
      day = parts[2]!;
    } else {
      if (year.length === 2) year = `20${year}`;
    }

    day = day.padStart(2, "0");
    month = month.padStart(2, "0");

    let monthNum = parseInt(month, 10);
    let dayNum = parseInt(day, 10);
    if (monthNum > 12 && dayNum <= 12) {
      const temp = month;
      month = day;
      day = temp;
      monthNum = parseInt(month, 10);
    }

    const yrNum = parseInt(year, 10);
    const academicYear =
      monthNum >= 6
        ? `${yrNum}-${(yrNum + 1).toString().slice(-2)}`
        : `${yrNum - 1}-${year.slice(-2)}`;
    return {
      date: `${year}-${month}-${day}`,
      month: monthNum,
      academicYear: ["2024-25", "2025-26", "2026-27"].includes(academicYear)
        ? academicYear
        : "2025-26",
    };
  }
  return { date: "2026-01-01", month: 1, academicYear: "2025-26" };
}

interface ParsedRow {
  title: string;
  organizer: string | null;
  dateStr: string;
  driveLink: string | null;
  coveredBy: string | null;
}

async function parseXLSX(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  const zip = await JSZip.loadAsync(buffer);
  const relsXml = (await zip.file("xl/worksheets/_rels/sheet1.xml.rels")?.async("text")) || "";
  const sheetXml = (await zip.file("xl/worksheets/sheet1.xml")?.async("text")) || "";
  const stringsXml = (await zip.file("xl/sharedStrings.xml")?.async("text")) || "";

  // Parse strings (including multi-part rich text)
  const strings: string[] = [];
  const siMatches = stringsXml.match(/<si>(.*?)<\/si>/gs) || [];
  for (const si of siMatches) {
    const tMatches = si.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
    const text = tMatches.map((m) => m.replace(/<[^>]+>/g, "")).join("");
    strings.push(text);
  }

  // Parse rels
  const rels: Record<string, string> = {};
  const relMatches = relsXml.match(/<Relationship [^>]+>/g) || [];
  for (const r of relMatches) {
    const id = r.match(/Id="([^"]+)"/)?.[1];
    const target = r.match(/Target="([^"]+)"/)?.[1];
    if (id && target) rels[id] = target;
  }

  // Parse hyperlinks by cell ref
  const cellLinks: Record<string, string> = {};
  const hlMatches = sheetXml.match(/<hyperlink [^>]+>/g) || [];
  for (const hl of hlMatches) {
    const rId = hl.match(/r:id="([^"]+)"/)?.[1];
    const ref = hl.match(/ref="([A-Z0-9]+)"/)?.[1];
    if (rId && ref && rels[rId]) {
      cellLinks[ref] = rels[rId];
    }
  }

  // Parse sheet rows
  const result: ParsedRow[] = [];
  const rowMatches = sheetXml.match(/<row [^>]*>.*?<\/row>/gs) || [];
  for (const rXml of rowMatches) {
    const rowNum = parseInt(rXml.match(/r="(\d+)"/)?.[1] || "0", 10);
    if (rowNum === 1) continue; // Skip header

    const cMatches = rXml.match(/<c [^>]*>(?:<v>.*?<\/v>)?<\/c>|<c [^>]*\/>/gs) || [];
    const cells: Record<string, string> = {};
    for (const cXml of cMatches) {
      const ref = cXml.match(/r="([A-Z0-9]+)"/)?.[1];
      if (!ref) continue;
      const col = ref.match(/^([A-Z]+)/)?.[1];
      if (!col) continue;

      const type = cXml.match(/t="([^"]+)"/)?.[1];
      const val = cXml.match(/<v>(.*?)<\/v>/)?.[1];
      let value = val || "";
      if (type === "s" && val !== undefined) {
        value = strings[parseInt(val, 10)] || "";
      } else if (col === "C" && val && !isNaN(Number(val))) {
        const serial = parseFloat(val);
        if (serial > 30000 && serial < 60000) {
          const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
          value = d.toISOString().split("T")[0]!;
        }
      }
      cells[col] = value;
    }

    const title = cells["A"]?.trim();
    if (!title || title.toLowerCase() === "2026-events" || title.toLowerCase() === "name of event") continue;

    const organizer = cells["B"]?.trim() || null;
    const dateStr = cells["C"]?.trim() || "";
    const driveLink = cellLinks[`D${rowNum}`] || cellLinks[`A${rowNum}`] || (cells["D"]?.startsWith("http") ? cells["D"] : null);
    const coveredBy = cells["E"]?.trim() || null;

    result.push({
      title,
      organizer,
      dateStr,
      driveLink,
      coveredBy,
    });
  }

  return result;
}

async function crawlDriveFolder(folderId: string, apiKey: string, depth = 0, subfolderPath = ""): Promise<any[]> {
  if (depth > 3) return [];
  const url = `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents+and+trashed=false&key=${apiKey}&fields=files(id,name,mimeType,size,createdTime)&pageSize=100`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const files = data.files || [];
    const images: any[] = [];

    for (const f of files) {
      if (f.mimeType === "application/vnd.google-apps.folder") {
        const nextPath = subfolderPath ? `${subfolderPath}/${f.name}` : f.name;
        const subImages = await crawlDriveFolder(f.id, apiKey, depth + 1, nextPath);
        images.push(...subImages);
      } else if (f.mimeType?.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name)) {
        images.push({
          ...f,
          subfolder: subfolderPath || null,
        });
      }
    }
    return images;
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sheetUrl = body.sheetUrl;

    const defaultUrl =
      "https://docs.google.com/spreadsheets/d/1LjdH_cwEqHTyeOMfExxFFXa7N8FNBqUUHZwhkFHxQQ4/edit?usp=drivesdk";
    const targetUrl = sheetUrl || defaultUrl;

    const spreadsheetId = extractSpreadsheetId(targetUrl);
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Invalid Google Sheets URL. Please provide a standard Google Spreadsheet link." },
        { status: 400 }
      );
    }

    const xlsxExportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    let parsedRows: ParsedRow[] = [];

    const res = await fetch(xlsxExportUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      parsedRows = await parseXLSX(buffer);
    } else {
      return NextResponse.json(
        { error: `Could not export Google Sheet as XLSX: ${res.statusText}. Please verify sharing is set to 'Anyone with link can view'.` },
        { status: 400 }
      );
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: "No event rows found in the sheet. Ensure the first tab has headers: NAME OF EVENT, ORGANIZER, DATE OF EVENT, EVENT LINK." },
        { status: 400 }
      );
    }

    const fallbackPath = path.join(process.cwd(), "src/lib/data/events-fallback.json");
    const cacheDir = path.join(process.cwd(), "src/lib/data/drive-photos");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    let existingEvents: Event[] = [];
    if (fs.existsSync(fallbackPath)) {
      try {
        existingEvents = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      } catch {
        existingEvents = [];
      }
    }

    const byFolder = new Map<string, Event>();
    const byTitle = new Map<string, Event>();
    for (const ev of existingEvents) {
      if (ev.drive_folder_id) byFolder.set(ev.drive_folder_id, ev);
      byTitle.set(ev.title.toLowerCase().trim(), ev);
    }

    let addedCount = 0;
    let updatedCount = 0;
    const processedEvents: Partial<Event>[] = [];
    const apiKey = (process.env.GOOGLE_DRIVE_API_KEY?.trim()) || DEFAULT_GOOGLE_DRIVE_API_KEY;

    for (const row of parsedRows) {
      const { title, organizer, dateStr, driveLink } = row;
      if (!title || title.length < 2) continue;

      const driveFolderId = extractDriveFolderId(driveLink || "");
      const { date, month, academicYear } = parseDate(dateStr);

      let matched: Event | undefined;
      // Match by drive_folder_id first so if title is renamed in sheet, it updates smoothly
      if (driveFolderId && byFolder.has(driveFolderId)) {
        matched = byFolder.get(driveFolderId);
      } else if (byTitle.has(title.toLowerCase().trim())) {
        matched = byTitle.get(title.toLowerCase().trim());
      }

      if (matched) {
        // Update title and slug if changed in sheet!
        if (matched.title !== title) {
          matched.title = title;
          matched.slug = slugify(title);
        }
        if (organizer) matched.organizing_club = organizer;
        if (!matched.drive_folder_id && driveFolderId) matched.drive_folder_id = driveFolderId;
        if (date && date !== "2026-01-01") {
          matched.event_date = date;
          matched.event_month = month;
          matched.academic_year = academicYear;
        }

        // Check if cover photo is missing or using folder ID
        const coverBroken =
          !matched.cover_photo_url ||
          (driveFolderId && matched.cover_photo_url.includes(driveFolderId)) ||
          matched.cover_photo_url.includes("placeholder");

        if (coverBroken && driveFolderId && apiKey) {
          const driveImages = await crawlDriveFolder(driveFolderId, apiKey);
          if (driveImages.length > 0) {
            matched.cover_photo_url = `https://lh3.googleusercontent.com/d/${driveImages[0].id}=w800`;
            matched.photo_count = driveImages.length;

            const photosList = driveImages.map((img: any, idx: number) => ({
              id: crypto.randomUUID(),
              event_id: matched!.id,
              drive_file_id: img.id,
              filename: img.subfolder ? `${img.subfolder}/${img.name}` : img.name,
              subfolder: img.subfolder || null,
              thumbnail_url: `https://lh3.googleusercontent.com/d/${img.id}=w800`,
              full_url: `https://lh3.googleusercontent.com/d/${img.id}`,
              width: 1920,
              height: 1080,
              size_bytes: parseInt(img.size || "0", 10),
              camera_make: "CBIT Photo Club",
              camera_model: "DSLR",
              lens: "Standard Zoom",
              taken_at: img.createdTime || matched!.event_date || new Date().toISOString(),
              view_count: 0,
              download_count: 0,
              is_published: true,
              is_cover: idx === 0,
              exif: {},
              uploaded_by: null,
              edited_by: null,
              created_at: img.createdTime || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            fs.writeFileSync(path.join(cacheDir, `${matched.id}.json`), JSON.stringify(photosList, null, 2));
            fs.writeFileSync(path.join(cacheDir, `${driveFolderId}.json`), JSON.stringify(photosList, null, 2));
          }
        }

        updatedCount++;
        processedEvents.push(matched);
      } else {
        const newId = crypto.randomUUID();
        const baseSlug = slugify(title);
        let finalSlug = baseSlug;
        let counter = 1;
        while (existingEvents.some((e) => e.slug === finalSlug)) {
          finalSlug = `${baseSlug}-${counter++}`;
        }

        let coverPhotoUrl: string | null = null;
        let photoCount = 0;

        if (driveFolderId && apiKey) {
          const driveImages = await crawlDriveFolder(driveFolderId, apiKey);
          if (driveImages.length > 0) {
            coverPhotoUrl = `https://lh3.googleusercontent.com/d/${driveImages[0].id}=w800`;
            photoCount = driveImages.length;

            const photosList = driveImages.map((img: any, idx: number) => ({
              id: crypto.randomUUID(),
              event_id: newId,
              drive_file_id: img.id,
              filename: img.subfolder ? `${img.subfolder}/${img.name}` : img.name,
              subfolder: img.subfolder || null,
              thumbnail_url: `https://lh3.googleusercontent.com/d/${img.id}=w800`,
              full_url: `https://lh3.googleusercontent.com/d/${img.id}`,
              width: 1920,
              height: 1080,
              size_bytes: parseInt(img.size || "0", 10),
              camera_make: "CBIT Photo Club",
              camera_model: "DSLR",
              lens: "Standard Zoom",
              taken_at: img.createdTime || date || new Date().toISOString(),
              view_count: 0,
              download_count: 0,
              is_published: true,
              is_cover: idx === 0,
              exif: {},
              uploaded_by: null,
              edited_by: null,
              created_at: img.createdTime || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            fs.writeFileSync(path.join(cacheDir, `${newId}.json`), JSON.stringify(photosList, null, 2));
            fs.writeFileSync(path.join(cacheDir, `${driveFolderId}.json`), JSON.stringify(photosList, null, 2));
          }
        }

        const newEvent: Event = {
          id: newId,
          title,
          slug: finalSlug,
          description: `${title} organized by ${organizer || "CBIT"} at CBIT campus. Official photography coverage by CBIT Photo Club.`,
          venue: "CBIT Campus",
          event_date: date,
          event_month: month,
          academic_year: academicYear,
          category: "Campus Events",
          department: null,
          organizing_club: organizer || "CBIT",
          drive_folder_id: driveFolderId,
          cover_photo_url: coverPhotoUrl,
          photo_count: photoCount,
          storage_bytes: 0,
          status: "published",
          view_count: 0,
          download_count: 0,
          subfolders: [],
          drive_last_synced_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        existingEvents.push(newEvent);
        if (driveFolderId) byFolder.set(driveFolderId, newEvent);
        byTitle.set(title.toLowerCase().trim(), newEvent);
        addedCount++;
        processedEvents.push(newEvent);
      }
    }

    // Save updated local JSON fallback
    existingEvents.sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));
    try {
      fs.writeFileSync(fallbackPath, JSON.stringify(existingEvents, null, 2));
    } catch {}

    // Sync to Supabase
    try {
      const admin = createAdminClient();
      const rowsToUpsert = processedEvents.map((e) => ({
        ...e,
        updated_at: new Date().toISOString(),
      }));
      await admin.from("events").upsert(rowsToUpsert, { onConflict: "id" });
    } catch {}

    return NextResponse.json({
      success: true,
      count: parsedRows.length,
      added: addedCount,
      updated: updatedCount,
      totalInCatalog: existingEvents.length,
      message: `Successfully processed ${parsedRows.length} events from Google Sheet (${addedCount} added, ${updatedCount} updated).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to sync events from Google Sheet." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
