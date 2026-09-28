const fs = require("fs");

const envFile = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith("\"") && val.endsWith("\"")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const API_KEY = env.GOOGLE_DRIVE_API_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY || !API_KEY) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|heic|heif|dng|tiff?|gif|cr[23]|nef|arw|raf|rw2|orf|pef|srw|bmp|avif)$/i;

async function findFirstImageInFolder(folderId, depth = 0) {
  if (depth > 3) return null;
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size)&pageSize=100&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const files = data.files || [];
    
    // Check direct images
    const images = files.filter(f => (f.mimeType && f.mimeType.startsWith("image/")) || IMAGE_EXT_REGEX.test(f.name || ""));
    if (images.length > 0) {
      return {
        coverId: images[0].id,
        count: images.length,
        totalBytes: images.reduce((acc, f) => acc + Number(f.size || 0), 0)
      };
    }

    // Check subfolders
    const subfolders = files.filter(f => f.mimeType === "application/vnd.google-apps.folder");
    for (const sub of subfolders) {
      const result = await findFirstImageInFolder(sub.id, depth + 1);
      if (result) return result;
    }
  } catch (err) {
    console.error(`Error querying folder ${folderId}:`, err.message);
  }
  return null;
}

async function run() {
  console.log("Fetching events needing cover photos...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?cover_photo_url=is.null&select=id,title,drive_folder_id`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const events = await res.json();
  console.log(`Found ${events.length} events needing cover photos.`);

  let updatedCount = 0;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e.drive_folder_id) continue;
    
    const info = await findFirstImageInFolder(e.drive_folder_id);
    if (info && info.coverId) {
      const coverUrl = `https://lh3.googleusercontent.com/d/${info.coverId}`;
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${e.id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          cover_photo_url: coverUrl,
          photo_count: info.count > 0 ? info.count : 1,
          storage_bytes: info.totalBytes > 0 ? info.totalBytes : null
        })
      });

      if (patchRes.ok) {
        updatedCount++;
        process.stdout.write(`\r[${i + 1}/${events.length}] Updated "${e.title.slice(0, 30)}" -> ${info.coverId} (${info.count} photos)\n`);
      }
    } else {
      process.stdout.write(`\r[${i + 1}/${events.length}] No images yet in "${e.title.slice(0, 30)}"\n`);
    }
  }

  console.log(`\nFinished! Successfully updated cover photos for ${updatedCount} events.`);
}

run();
