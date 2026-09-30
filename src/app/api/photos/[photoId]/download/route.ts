import { NextResponse } from "next/server";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getDriveClient } from "@/lib/drive/client";
import { DEFAULT_PHOTOS } from "@/lib/services/photos.service";
import { extractDriveFolderId } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ photoId: string }>;
}

async function streamFallbackUrl(fileId: string, filename: string) {
  const cleanFilename = filename.split("/").pop() || filename || "photo.jpg";
  const urlsToTry = [
    `https://lh3.googleusercontent.com/d/${fileId}=s2400`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2400`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
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
          return new NextResponse(arrayBuffer, {
            headers: {
              "Content-Type": "image/jpeg",
              "Content-Disposition": `attachment; filename="${cleanFilename}"`,
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
      }
    } catch {
      // try next
    }
  }

  // Never return 307 redirect to prevent browser fetch CORS failures during ZIP downloading
  try {
    const fallbackPath = path.join(process.cwd(), "public", "images", "placeholder-event.jpg");
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${cleanFilename}"`,
          "Cache-Control": "private, max-age=60",
        },
      });
    }
  } catch {}

  return new NextResponse(null, { status: 404 });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { photoId } = await params;
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

  const cleanFilename = filename.split("/").pop() || filename || "photo.jpg";

  // 1. Try Google Drive API stream
  try {
    const drive = getDriveClient();
    const fileRes = await drive.files.get(
      { fileId: driveFileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    );

    const nodeStream = fileRes.data as Readable;
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

    if (dbPhotoId && eventId) {
      const admin = createAdminClient();
      await Promise.all([
        admin.rpc("increment_photo_downloads" as any, { p_photo_id: dbPhotoId, p_count: 1 } as any).catch(() => {}),
        admin.rpc("increment_event_downloads" as any, { p_event_id: eventId, p_count: 1 } as any).catch(() => {}),
      ]);
    }

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${cleanFilename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    // 2. Drive API unconfigured or failed — stream binary image directly from CDN URL with attachment disposition!
    const cleanId = extractDriveFolderId(driveFileId) || driveFileId;
    return streamFallbackUrl(cleanId, cleanFilename);
  }
}
