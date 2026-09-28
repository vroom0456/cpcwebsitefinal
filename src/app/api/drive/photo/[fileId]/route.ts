import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "drive-thumbs");

// Ensure cache directory exists synchronously on module load
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore
}

// In-flight request deduplication map to prevent thundering herd
const pendingFetches = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();

async function fetchImageFromGoogle(fileId: string, size: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  // 1. Try Google Drive API thumbnailLink (authenticated with API key, never rate-limited)
  if (apiKey) {
    try {
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,mimeType&key=${apiKey}`;
      const metaRes = await fetch(metaUrl);
      if (metaRes.ok) {
        const meta = await metaRes.json();
        let thumbUrl = meta.thumbnailLink;
        if (thumbUrl) {
          thumbUrl = thumbUrl.replace(/=s\d+/, `=s${size}`);
          const imgRes = await fetch(thumbUrl);
          if (imgRes.ok) {
            const arr = await imgRes.arrayBuffer();
            return {
              buffer: Buffer.from(arr),
              contentType: imgRes.headers.get("content-type") || "image/jpeg",
            };
          }
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 2. Try drive.google.com/thumbnail endpoint
  try {
    const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    const imgRes = await fetch(thumbUrl, { redirect: "follow" });
    if (imgRes.ok) {
      const arr = await imgRes.arrayBuffer();
      if (arr.byteLength > 1000) {
        return {
          buffer: Buffer.from(arr),
          contentType: imgRes.headers.get("content-type") || "image/jpeg",
        };
      }
    }
  } catch {
    // Continue
  }

  // 3. Try lh3.googleusercontent.com/d/ fallback
  try {
    const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
    const imgRes = await fetch(lh3Url);
    if (imgRes.ok) {
      const arr = await imgRes.arrayBuffer();
      if (arr.byteLength > 1000) {
        return {
          buffer: Buffer.from(arr),
          contentType: imgRes.headers.get("content-type") || "image/jpeg",
        };
      }
    }
  } catch {
    // Fail
  }

  return null;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await props.params;

  if (!fileId || fileId.length < 10) {
    return NextResponse.json({ error: "Missing or invalid fileId" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("sz") || searchParams.get("s") || "800";
  const size = Math.min(Math.max(parseInt(sizeParam, 10) || 800, 200), 2048);

  const cacheKey = `${fileId}_s${size}.jpg`;
  const cachePath = path.join(CACHE_DIR, cacheKey);

  // 1. FAST PATH: Check disk cache (served in ~1ms!)
  try {
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      if (stats.size > 500) {
        const fileStream = fs.createReadStream(cachePath);
        // Convert node stream to web ReadableStream
        const stream = new ReadableStream({
          start(controller) {
            fileStream.on("data", (chunk) => controller.enqueue(chunk));
            fileStream.on("end", () => controller.close());
            fileStream.on("error", (err) => controller.error(err));
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": String(stats.size),
            "X-Cache": "HIT",
          },
        });
      }
    }
  } catch {
    // Fall back to fetching
  }

  // 2. DEDUPLICATED NETWORK FETCH: fetch once if multiple clients request simultaneously
  let fetchPromise = pendingFetches.get(cacheKey);
  if (!fetchPromise) {
    fetchPromise = fetchImageFromGoogle(fileId, size);
    pendingFetches.set(cacheKey, fetchPromise);
  }

  let result = null;
  try {
    result = await fetchPromise;
  } finally {
    pendingFetches.delete(cacheKey);
  }

  if (!result || result.buffer.byteLength < 500) {
    // If Google Drive rate limits or blocks, return fallback image
    const fallbackPath = path.join(process.cwd(), "public", "images", "placeholder-event.jpg");
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath);
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=60",
          "X-Cache": "FALLBACK",
        },
      });
    }
    return NextResponse.json({ error: "Image not available" }, { status: 404 });
  }

  // Save to disk cache asynchronously
  try {
    fs.writeFile(cachePath, result.buffer, () => {});
  } catch {
    // Non-fatal
  }

  return new Response(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(result.buffer.byteLength),
      "X-Cache": "MISS",
    },
  });
}


