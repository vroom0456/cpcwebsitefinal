const fs = require("fs");
const path = require("path");

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

const CACHE_DIR = path.join(process.cwd(), ".cache", "drive-thumbs");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const DISQUALIFIED_WORDS = [
  "logo", "banner", "poster", "certificate", "brochure", "invitation", 
  "flyer", "pamphlet", "schedule", "badge", "idcard", "icon", "dp", 
  "profile", "signature", "stamp", "letter", "notice", "text"
];

const CAMERA_PREFIXES = /^(dsc|img|_mg|_dsc|dji|sam|nik|can|202[0-9])[0-9_]/i;

function scoreImage(f, index, total) {
  const name = (f.name || "").toLowerCase();
  let score = 100;
  
  // Strongly penalize non-photos
  for (const word of DISQUALIFIED_WORDS) {
    if (name.includes(word)) score -= 300;
  }
  
  // PNGs are almost always graphic logos/posters in photo folders
  if (name.endsWith(".png")) score -= 120;
  
  // Camera filename pattern (Sony, Canon, Nikon, DJI)
  if (CAMERA_PREFIXES.test(f.name || "")) {
    score += 150;
  }
  
  const size = Number(f.size || 0);
  if (size > 1000000 && size < 40000000) {
    score += 50; // Real camera photo size (1MB - 40MB)
  } else if (size < 250000) {
    score -= 100; // Small icons/watermarks
  }
  
  // Landscape aspect ratio is best for event cover cards
  const w = f.imageMediaMetadata?.width || 0;
  const h = f.imageMediaMetadata?.height || 0;
  if (w > h && w >= 1600) {
    score += 40;
  }
  
  // Pick photos from the active part of the event (10% to 50% into folder)
  const relPos = total > 1 ? index / total : 0;
  if (relPos >= 0.05 && relPos <= 0.6) {
    score += 20;
  }
  
  return score;
}

async function getFolderImages(folderId, depth = 0) {
  if (depth > 2) return [];
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size,mimeType,imageMediaMetadata)&pageSize=100&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const files = data.files || [];
    
    let images = files.filter(f => f.mimeType && f.mimeType.startsWith("image/"));
    
    // If fewer than 2 images, check subfolders
    if (images.length < 2) {
      const subfolders = files.filter(f => f.mimeType === "application/vnd.google-apps.folder");
      for (const sub of subfolders) {
        const subImgs = await getFolderImages(sub.id, depth + 1);
        images.push(...subImgs);
        if (images.length >= 10) break;
      }
    }
    
    return images;
  } catch {
    return [];
  }
}

async function cacheImage(fileId) {
  const cachePath = path.join(CACHE_DIR, `${fileId}_s800.jpg`);
  if (fs.existsSync(cachePath)) return;

  try {
    // 1. Try Drive API thumbnailLink
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink&key=${API_KEY}`);
    if (metaRes.ok) {
      const meta = await metaRes.json();
      if (meta.thumbnailLink) {
        const thumbUrl = meta.thumbnailLink.replace(/=s\d+/, "=s800");
        const imgRes = await fetch(thumbUrl);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.byteLength > 1000) {
            fs.writeFileSync(cachePath, buf);
            return;
          }
        }
      }
    }
    
    // 2. Fallback
    const altRes = await fetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`, { redirect: "follow" });
    if (altRes.ok) {
      const buf = Buffer.from(await altRes.arrayBuffer());
      if (buf.byteLength > 1000) {
        fs.writeFileSync(cachePath, buf);
      }
    }
  } catch {
    // Non-fatal
  }
}

async function run() {
  console.log("Fetching all published events to select real photo covers...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?status=eq.published&select=id,title,drive_folder_id,cover_photo_url`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const events = await res.json();
  console.log(`Found ${events.length} published events.`);

  let updated = 0;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e.drive_folder_id) continue;

    const images = await getFolderImages(e.drive_folder_id);
    if (images.length === 0) continue;

    images.sort((a, b) => scoreImage(b, images.indexOf(b), images.length) - scoreImage(a, images.indexOf(a), images.length));
    const best = images[0];

    if (best && best.id) {
      const newCoverUrl = `https://lh3.googleusercontent.com/d/${best.id}`;
      
      // Pre-warm local disk cache for instant 1ms loading
      await cacheImage(best.id);

      // Update in Supabase
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${e.id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          cover_photo_url: newCoverUrl,
          photo_count: Math.max(images.length, 1)
        })
      });

      if (patchRes.ok) {
        updated++;
        process.stdout.write(`\r[${i + 1}/${events.length}] "${e.title.slice(0, 25)}" -> Photo: "${best.name}" (${(best.size / 1024 / 1024).toFixed(1)}MB)\n`);
      }
    }
  }

  console.log(`\nAll done! Updated ${updated} events with real action photos (zero logos).`);
}

run();
