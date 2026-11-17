import fs from "fs";
import path from "path";
import crypto from "crypto";
import JSZip from "jszip";

const API_KEY = process.env.GOOGLE_DRIVE_API_KEY || "AIzaSyB5cxzVRTQP20h1JJYRmCUvDEQaCLFD2QM";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1LjdH_cwEqHTyeOMfExxFFXa7N8FNBqUUHZwhkFHxQQ4/export?format=xlsx";

const fallbackPath = path.join(process.cwd(), "src/lib/data/events-fallback.json");
const cacheDir = path.join(process.cwd(), "src/lib/data/drive-photos");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

function extractDriveFolderId(url) {
  if (!url) return null;
  const match = url.match(/folders\/([a-zA-Z0-9_-]{20,})/);
  if (match && match[1]) return match[1];
  const fileMatch = url.match(/(?:file\/d\/|id=)([a-zA-Z0-9_-]{20,})/);
  return (fileMatch && fileMatch[1]) || null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseDate(dateStr) {
  if (!dateStr) return { date: "2026-01-01", month: 1, academicYear: "2025-26" };

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [year, month] = dateStr.trim().split("-");
    const yrNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const academicYear =
      monthNum >= 6
        ? `${yrNum}-${(yrNum + 1).toString().slice(-2)}`
        : `${yrNum - 1}-${year.slice(-2)}`;
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
    let year = parts[2];
    let day = parts[0];
    let month = parts[1];

    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
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

async function fetchGoogleSheetRows() {
  console.log("Fetching Google Sheet:", SHEET_URL);
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const relsXml = (await zip.file("xl/worksheets/_rels/sheet1.xml.rels")?.async("text")) || "";
  const sheetXml = (await zip.file("xl/worksheets/sheet1.xml")?.async("text")) || "";
  const stringsXml = (await zip.file("xl/sharedStrings.xml")?.async("text")) || "";

  const strings = [];
  const siMatches = stringsXml.match(/<si>(.*?)<\/si>/gs) || [];
  for (const si of siMatches) {
    const tMatches = si.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
    const text = tMatches.map((m) => m.replace(/<[^>]+>/g, "")).join("");
    strings.push(text);
  }

  const rels = {};
  const relMatches = relsXml.match(/<Relationship [^>]+>/g) || [];
  for (const r of relMatches) {
    const id = r.match(/Id="([^"]+)"/)?.[1];
    const target = r.match(/Target="([^"]+)"/)?.[1];
    if (id && target) rels[id] = target;
  }

  const cellLinks = {};
  const hlMatches = sheetXml.match(/<hyperlink [^>]+>/g) || [];
  for (const hl of hlMatches) {
    const rId = hl.match(/r:id="([^"]+)"/)?.[1];
    const ref = hl.match(/ref="([A-Z0-9]+)"/)?.[1];
    if (rId && ref && rels[rId]) {
      cellLinks[ref] = rels[rId];
    }
  }

  const rows = [];
  const rowMatches = sheetXml.match(/<row [^>]*>.*?<\/row>/gs) || [];
  for (const rXml of rowMatches) {
    const rowNum = parseInt(rXml.match(/r="(\d+)"/)?.[1] || "0", 10);
    if (rowNum === 1) continue;

    const cMatches = rXml.match(/<c [^>]*>(?:<v>.*?<\/v>)?<\/c>|<c [^>]*\/>/gs) || [];
    const cells = {};
    for (const cXml of cMatches) {
      const ref = cXml.match(/r="([A-Z0-9]+)"/)?.[1];
      if (!ref) continue;
      const col = ref.match(/^([A-Z]+)/)?.[1];
      const type = cXml.match(/t="([^"]+)"/)?.[1];
      const val = cXml.match(/<v>(.*?)<\/v>/)?.[1];
      let value = val || "";
      if (type === "s" && val !== undefined) {
        value = strings[parseInt(val, 10)] || "";
      } else if (col === "C" && val && !isNaN(val)) {
        const serial = parseFloat(val);
        if (serial > 30000 && serial < 60000) {
          const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
          value = d.toISOString().split("T")[0];
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

    rows.push({ rowNum, title, organizer, dateStr, driveLink, coveredBy });
  }

  console.log(`Parsed ${rows.length} rows from Google Sheet.`);
  return rows;
}

async function crawlDriveFolder(folderId, depth = 0, subfolderPath = "") {
  if (depth > 3) return [];
  const url = `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType,size,createdTime)&pageSize=100`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const files = data.files || [];
    const images = [];

    for (const f of files) {
      if (f.mimeType === "application/vnd.google-apps.folder") {
        const nextPath = subfolderPath ? `${subfolderPath}/${f.name}` : f.name;
        const subImages = await crawlDriveFolder(f.id, depth + 1, nextPath);
        images.push(...subImages);
      } else if (f.mimeType?.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name)) {
        images.push({
          ...f,
          subfolder: subfolderPath || null,
        });
      }
    }
    return images;
  } catch (err) {
    return [];
  }
}

async function main() {
  const parsedRows = await fetchGoogleSheetRows();

  let existingEvents = [];
  if (fs.existsSync(fallbackPath)) {
    try {
      existingEvents = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    } catch {
      existingEvents = [];
    }
  }

  const byFolder = new Map();
  const byTitle = new Map();
  for (const ev of existingEvents) {
    if (ev.drive_folder_id) byFolder.set(ev.drive_folder_id, ev);
    byTitle.set(ev.title.toLowerCase().trim(), ev);
  }

  let addedCount = 0;
  let updatedCount = 0;

  for (const row of parsedRows) {
    const { title, organizer, dateStr, driveLink } = row;
    if (!title || title.length < 2) continue;

    const driveFolderId = extractDriveFolderId(driveLink || "");
    const { date, month, academicYear } = parseDate(dateStr);

    let matched;
    // 1. MATCH BY DRIVE FOLDER ID FIRST (so if user renames title in sheet, it updates properly!)
    if (driveFolderId && byFolder.has(driveFolderId)) {
      matched = byFolder.get(driveFolderId);
    } else if (byTitle.has(title.toLowerCase().trim())) {
      matched = byTitle.get(title.toLowerCase().trim());
    }

    if (matched) {
      // Update title, slug, and organizer
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
      updatedCount++;
    } else {
      const newId = crypto.randomUUID();
      const baseSlug = slugify(title);
      let finalSlug = baseSlug;
      let counter = 1;
      while (existingEvents.some((e) => e.slug === finalSlug)) {
        finalSlug = `${baseSlug}-${counter++}`;
      }

      const newEvent = {
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
        cover_photo_url: null,
        photo_count: 0,
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
    }
  }

  console.log(`Events sync complete. Added: ${addedCount}, Updated: ${updatedCount}. Total catalog: ${existingEvents.length}`);

  // Now, crawl Drive photos recursively for any event missing photos or with a broken cover
  console.log("\nStarting recursive Drive photo crawler for all events with Drive folders...");
  let crawledCount = 0;
  let fixedCovers = 0;

  for (const event of existingEvents) {
    if (!event.drive_folder_id) continue;
    const folderId = event.drive_folder_id;

    const eventCachePath = path.join(cacheDir, `${event.id}.json`);
    const folderCachePath = path.join(cacheDir, `${folderId}.json`);

    let existingPhotos = [];
    if (fs.existsSync(eventCachePath)) {
      try {
        existingPhotos = JSON.parse(fs.readFileSync(eventCachePath, "utf-8"));
      } catch {}
    } else if (fs.existsSync(folderCachePath)) {
      try {
        existingPhotos = JSON.parse(fs.readFileSync(folderCachePath, "utf-8"));
      } catch {}
    }

    const coverBroken =
      !event.cover_photo_url ||
      event.cover_photo_url.includes(folderId) ||
      event.cover_photo_url.includes("placeholder");

    if (existingPhotos.length > 0) {
      if (coverBroken) {
        event.cover_photo_url = existingPhotos[0].thumbnail_url || `https://lh3.googleusercontent.com/d/${existingPhotos[0].drive_file_id}=w800`;
        event.photo_count = existingPhotos.length;
        fixedCovers++;
      }
    } else {
      console.log(`Crawling Drive for "${event.title}" (${folderId})...`);
      const driveImages = await crawlDriveFolder(folderId);

      if (driveImages.length > 0) {
        const photosList = driveImages.map((img, idx) => ({
          id: crypto.randomUUID(),
          event_id: event.id,
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
          taken_at: img.createdTime || event.event_date || new Date().toISOString(),
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

        fs.writeFileSync(eventCachePath, JSON.stringify(photosList, null, 2));
        fs.writeFileSync(folderCachePath, JSON.stringify(photosList, null, 2));

        event.cover_photo_url = `https://lh3.googleusercontent.com/d/${driveImages[0].id}=w800`;
        event.photo_count = driveImages.length;
        fixedCovers++;
        console.log(`  -> Found ${driveImages.length} photos! Set cover to ${driveImages[0].id}`);
      } else {
        console.log(`  -> 0 images found for folder ${folderId}`);
      }
      crawledCount++;
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  // Sort by date descending
  existingEvents.sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));

  // Save fallback events
  fs.writeFileSync(fallbackPath, JSON.stringify(existingEvents, null, 2));
  console.log(`\nSuccessfully saved ${existingEvents.length} events to ${fallbackPath}`);
  console.log(`Crawled ${crawledCount} folders, fixed/set covers for ${fixedCovers} events.`);
}

main().catch(console.error);
