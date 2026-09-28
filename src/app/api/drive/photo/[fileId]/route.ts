import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/drive/client";

async function fetchImageFallbackBytes(fileId: string) {
  const urlsToTry = [
    `https://lh3.googleusercontent.com/d/${fileId}=s1600`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    `https://docs.google.com/uc?export=download&id=${fileId}`,
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
        },
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "image/jpeg";
        // Ensure we actually got an image, not an HTML error/login page
        if (contentType.startsWith("image/") || contentType.includes("octet-stream")) {
          const buffer = await res.arrayBuffer();
          return { buffer, contentType: "image/jpeg" };
        }
      }
    } catch {
      // Continue to next fallback URL
    }
  }

  return null;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await props.params;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  // 1. Try Google Drive API if configured
  try {
    const drive = getDriveClient();
    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "arraybuffer" }
    );

    const headers = new Headers();
    const contentType = (res.headers["content-type"] as string) || "image/jpeg";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(Buffer.from(res.data as ArrayBuffer), { headers });
  } catch {
    // 2. Drive API credentials missing or unconfigured — server-side fetch from Google CDN & stream binary bytes directly!
    const fallback = await fetchImageFallbackBytes(fileId);

    if (fallback) {
      const headers = new Headers();
      headers.set("Content-Type", fallback.contentType);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new NextResponse(fallback.buffer, { headers });
    }

    // 3. Final fallback: redirect to CDN if server-side fetch failed
    return NextResponse.redirect(`https://lh3.googleusercontent.com/d/${fileId}=s1600`, { status: 307 });
  }
}
