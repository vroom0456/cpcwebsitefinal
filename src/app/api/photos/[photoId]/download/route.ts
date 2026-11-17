import { NextResponse } from "next/server";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getDriveClient } from "@/lib/drive/client";
import { DEFAULT_PHOTOS } from "@/lib/services/photos.service";
import { extractDriveFolderId } from "@/lib/utils";
import { embedCpcCreditLossless } from "@/lib/utils/lossless-metadata";

interface RouteParams {
  params: Promise<{ photoId: string }>;
}

function buildContentDispositionHeaders(filename: string) {
  const safeAscii = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const encodedName = encodeURIComponent(filename);
  return `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodedName}`;
}

async function streamFallbackUrl(fileId: string, filename: string, variant: string) {
  let cleanFilename = filename.split("/").pop() || filename || "photo.jpg";
  if (!/\.[a-zA-Z0-9]{3,4}$/.test(cleanFilename)) {
    cleanFilename = `${cleanFilename}.jpg`;
  }

  const urlsToTry = [
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
    `https://lh3.googleusercontent.com/d/${fileId}=s0`,
    `https://lh3.googleusercontent.com/d/${fileId}=s2400`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2400`,
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
        const ct = res.headers.get("content-type") || "image/jpeg";
        if (ct.startsWith("image/") || ct.includes("octet-stream")) {
          const arrayBuffer = await res.arrayBuffer();
          let buf: Buffer = Buffer.from(arrayBuffer);

          // Embed lossless CPC credit if requested and not raw original
          if (variant !== "original") {
            buf = Buffer.from(embedCpcCreditLossless(buf, ct));
          }

          return new NextResponse(new Uint8Array(buf), {
            headers: {
              "Content-Type": ct.startsWith("image/") ? ct : "image/jpeg",
              "Content-Disposition": buildContentDispositionHeaders(cleanFilename),
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "Pragma": "no-cache",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }
    } catch {
      // try next
    }
  }

  // Never substitute placeholder logo or wrong images for downloads.
  // Return explicit 404 JSON so clients handle missing assets correctly.
  return NextResponse.json(
    { error: "Photograph unavailable or deleted from archive" },
    { status: 404 }
  );
}

export async function GET(request: Request, { params }: RouteParams) {
  const { photoId } = await params;
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") || "cpc"; // "cpc" | "original"

  let driveFileId = photoId;
  let filename = "photo.jpg";
  let eventId: string | null = null;
  let dbPhotoId: string | null = null;

  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(photoId);

    const { data: photo } = isUuid
      ? await supabase.from("photos").select("id, event_id, drive_file_id, filename").eq("id", photoId).maybeSingle()
      : await supabase.from("photos").select("id, event_id, drive_file_id, filename").eq("drive_file_id", photoId).maybeSingle();

    const fallbackPhoto = !photo ? DEFAULT_PHOTOS.find((p) => p.id === photoId || p.drive_file_id === photoId) : null;
    const resolvedPhoto = photo || fallbackPhoto;

    if (resolvedPhoto) {
      driveFileId = resolvedPhoto.drive_file_id;
      filename = resolvedPhoto.filename;
      eventId = resolvedPhoto.event_id;
      dbPhotoId = resolvedPhoto.id;
    }
  } catch (err) {
    console.warn("Ignored DB lookup error in photo download:", err);
    const fallbackPhoto = DEFAULT_PHOTOS.find((p) => p.id === photoId || p.drive_file_id === photoId);
    if (fallbackPhoto) {
      driveFileId = fallbackPhoto.drive_file_id;
      filename = fallbackPhoto.filename;
      eventId = fallbackPhoto.event_id;
      dbPhotoId = fallbackPhoto.id;
    }
  }

  // 1. Authoritative filename resolution
  let cleanFilename = filename.split("/").pop() || filename || "photo.jpg";

  // 2. Try Google Drive API stream
  try {
    const drive = getDriveClient();

    // If filename is generic "photo.jpg", query Drive file metadata to get the authoritative name
    if (cleanFilename === "photo.jpg" && driveFileId) {
      try {
        const meta = await drive.files.get({
          fileId: driveFileId,
          fields: "name, mimeType",
          supportsAllDrives: true,
        });
        if (meta.data.name) {
          cleanFilename = meta.data.name;
        }
      } catch {}
    }

    if (!/\.[a-zA-Z0-9]{3,4}$/.test(cleanFilename)) {
      cleanFilename = `${cleanFilename}.jpg`;
    }

    const fileRes = await drive.files.get(
      { fileId: driveFileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    );

    const nodeStream = fileRes.data as Readable;

    if (dbPhotoId && eventId) {
      const admin = createAdminClient();
      await Promise.all([
        admin.rpc("increment_photo_downloads" as any, { p_photo_id: dbPhotoId, p_count: 1 } as any).catch(() => {}),
        admin.rpc("increment_event_downloads" as any, { p_event_id: eventId, p_count: 1 } as any).catch(() => {}),
      ]);
    }

    // If variant is "original", stream directly without buffering
    if (variant === "original") {
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          nodeStream.destroy();
        },
      });

      return new NextResponse(webStream, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": buildContentDispositionHeaders(cleanFilename),
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // If variant is "cpc", collect buffer to losslessly embed XMP attribution
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    let fullBuffer: Buffer = Buffer.concat(chunks);
    fullBuffer = Buffer.from(embedCpcCreditLossless(fullBuffer, "image/jpeg"));

    return new NextResponse(new Uint8Array(fullBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": buildContentDispositionHeaders(cleanFilename),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // 3. Drive API unconfigured or failed — stream binary image directly from CDN URL with attachment disposition
    const cleanId = extractDriveFolderId(driveFileId) || driveFileId;
    return streamFallbackUrl(cleanId, cleanFilename, variant);
  }
}
