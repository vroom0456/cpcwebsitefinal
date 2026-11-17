import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_DIR = process.env.VERCEL
  ? path.join("/tmp", "drive-thumbs")
  : path.join(process.cwd(), ".cache", "drive-thumbs");

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

  // 1. FAST DISK CACHE: If already cached on disk, return immediately
  try {
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      if (stats.size > 500) {
        const fileStream = fs.createReadStream(cachePath);
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
    // Continue
  }

  // 2. Direct 307 redirect to Google Global Edge CDN (sub-10ms response, zero server memory/CPU load)
  const targetCdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;

  return NextResponse.redirect(targetCdnUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
