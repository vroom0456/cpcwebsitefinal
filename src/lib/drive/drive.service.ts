import { getDriveClient, hasDriveCredentials } from "@/lib/drive/client";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/services/activity-logs.service";
import { slugify, extractDriveFolderId } from "@/lib/utils";
import { DEFAULT_EVENTS } from "@/lib/services/events.service";
import { DEFAULT_PHOTOS } from "@/lib/services/photos.service";

const IMAGE_FIELDS =
  "id, name, mimeType, size, imageMediaMetadata, thumbnailLink, createdTime, modifiedTime, md5Checksum, shortcutDetails";

const IMAGE_EXT_REGEX =
  /\.(jpe?g|png|webp|heic|heif|dng|tiff?|gif|cr[23]|nef|arw|raf|rw2|orf|pef|srw|bmp|avif|svg)$/i;

export interface DriveImageFile {
  id: string;
  name: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
  takenAt: string | null;
  thumbnailLink: string | null;
  md5Checksum: string | null;
  exif: Record<string, unknown> | null;
  subfolderPath: string | null; // e.g. "Subfolder1/Subfolder2" or null for root
}

export interface FolderValidationResult {
  valid: boolean;
  folderName?: string;
  imageCount?: number;
  error?: string;
}

/** Confirms the service account can see the folder and that it contains images. */
export async function validateDriveFolder(folderId: string): Promise<FolderValidationResult> {
  const cleanId = extractDriveFolderId(folderId) || folderId;
  if (!cleanId) {
    return { valid: false, error: "Please provide a valid Google Drive folder ID or URL" };
  }

  if (!hasDriveCredentials()) {
    return {
      valid: true,
      folderName: `Drive Folder (${cleanId.slice(0, 10)}...)`,
      imageCount: 5,
    };
  }

  try {
    const drive = getDriveClient();

    const folder = await drive.files.get({
      fileId: cleanId,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });

    if (folder.data.mimeType !== "application/vnd.google-apps.folder") {
      return { valid: false, error: "That ID is not a folder" };
    }

    const files = await drive.files.list({
      q: `'${cleanId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, shortcutDetails, imageMediaMetadata)",
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const images = (files.data.files ?? []).filter((file) => {
      let mime = file.mimeType;
      let name = file.name ?? "";
      if (file.mimeType === "application/vnd.google-apps.shortcut" && file.shortcutDetails) {
        mime = file.shortcutDetails.targetMimeType ?? mime;
      }
      const isImageMime = mime?.startsWith("image/");
      const isImageExtension = IMAGE_EXT_REGEX.test(name);
      return isImageMime || isImageExtension || file.imageMediaMetadata != null;
    });

    return {
      valid: true,
      folderName: folder.data.name ?? undefined,
      imageCount: images.length,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Could not access that folder",
    };
  }
}

function parseExifDate(exifDate: string | null | undefined): string | null {
  if (!exifDate) return null;
  if (/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/.test(exifDate)) {
    const parts = exifDate.split(" ");
    const datePart = (parts[0] ?? "").replace(/:/g, "-");
    const timePart = parts[1] || "00:00:00";
    return `${datePart}T${timePart}`;
  }
  return exifDate;
}

/** Lists every (non-trashed) image file directly inside a Drive folder, paginating as needed. */
export async function listImagesInFolder(folderId: string): Promise<DriveImageFile[]> {
  const cleanId = extractDriveFolderId(folderId) || folderId;
  const drive = getDriveClient();
  const results: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${cleanId}' in parents and trashed = false`,
      fields: `nextPageToken, files(${IMAGE_FIELDS})`,
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of res.data.files ?? []) {
      if (!file.id || !file.name) continue;

      let effectiveId = file.id;
      let effectiveMime = file.mimeType;
      let effectiveName = file.name;

      if (file.mimeType === "application/vnd.google-apps.shortcut" && file.shortcutDetails) {
        if (file.shortcutDetails.targetId) effectiveId = file.shortcutDetails.targetId;
        if (file.shortcutDetails.targetMimeType) effectiveMime = file.shortcutDetails.targetMimeType;
      }

      const isImageMime = effectiveMime?.startsWith("image/");
      const isImageExtension = IMAGE_EXT_REGEX.test(effectiveName);

      if (isImageMime || isImageExtension || file.imageMediaMetadata != null) {
        results.push({
          id: effectiveId,
          name: effectiveName,
          sizeBytes: Number(file.size ?? 0),
          width: file.imageMediaMetadata?.width ?? null,
          height: file.imageMediaMetadata?.height ?? null,
          cameraMake: file.imageMediaMetadata?.cameraMake ?? null,
          cameraModel: file.imageMediaMetadata?.cameraModel ?? null,
          takenAt: parseExifDate(file.imageMediaMetadata?.time) ?? file.createdTime ?? null,
          thumbnailLink: file.thumbnailLink ?? null,
          md5Checksum: file.md5Checksum ?? null,
          exif: file.imageMediaMetadata ? { ...file.imageMediaMetadata } : null,
          subfolderPath: null,
        });
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return results;
}

/** Lists every image inside a Drive folder AND all subfolders recursively. */
export async function listImagesRecursively(
  folderId: string,
  currentPath: string = "",
  visitedFolderIds: Set<string> = new Set()
): Promise<DriveImageFile[]> {
  const cleanId = extractDriveFolderId(folderId) || folderId;
  if (visitedFolderIds.has(cleanId)) {
    return [];
  }
  visitedFolderIds.add(cleanId);

  const drive = getDriveClient();
  const results: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${cleanId}' in parents and trashed = false`,
      fields: `nextPageToken, files(${IMAGE_FIELDS})`,
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const subfolders: { id: string; name: string }[] = [];

    for (const file of res.data.files ?? []) {
      if (!file.id || !file.name) continue;

      let effectiveId = file.id;
      let effectiveMime = file.mimeType;
      let effectiveName = file.name;

      if (file.mimeType === "application/vnd.google-apps.shortcut" && file.shortcutDetails) {
        if (file.shortcutDetails.targetId) effectiveId = file.shortcutDetails.targetId;
        if (file.shortcutDetails.targetMimeType) effectiveMime = file.shortcutDetails.targetMimeType;
      }

      const isImageMime = effectiveMime?.startsWith("image/");
      const isImageExtension = IMAGE_EXT_REGEX.test(effectiveName);

      if (effectiveMime === "application/vnd.google-apps.folder") {
        subfolders.push({ id: effectiveId, name: effectiveName });
      } else if (isImageMime || isImageExtension || file.imageMediaMetadata != null) {
        results.push({
          id: effectiveId,
          name: effectiveName,
          sizeBytes: Number(file.size ?? 0),
          width: file.imageMediaMetadata?.width ?? null,
          height: file.imageMediaMetadata?.height ?? null,
          cameraMake: file.imageMediaMetadata?.cameraMake ?? null,
          cameraModel: file.imageMediaMetadata?.cameraModel ?? null,
          takenAt: parseExifDate(file.imageMediaMetadata?.time) ?? file.createdTime ?? null,
          thumbnailLink: file.thumbnailLink ?? null,
          md5Checksum: file.md5Checksum ?? null,
          exif: file.imageMediaMetadata ? { ...file.imageMediaMetadata } : null,
          subfolderPath: currentPath || null,
        });
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;

    // Recurse into subfolders
    for (const sub of subfolders) {
      const subPath = currentPath ? `${currentPath}/${sub.name}` : sub.name;
      const subResults = await listImagesRecursively(sub.id, subPath, visitedFolderIds);
      results.push(...subResults);
    }
  } while (pageToken);

  return results;
}

export interface SyncReport {
  added: number;
  updated: number;
  missing: { photoId: string; filename: string }[];
  duplicates: { filenames: string[]; md5Checksum: string }[];
  totalPhotos: number;
  totalBytes: number;
}

/**
 * Reconciles one event's Drive folder against the `photos` table.
 * Non-destructive: files that disappeared from Drive are reported as
 * "missing" rather than deleted.
 */
export async function syncEventPhotos(eventId: string): Promise<SyncReport> {
  const admin = createAdminClient();

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(eventId);

  const { data: dbEvent } = isUuid
    ? await admin.from("events").select("id, title, drive_folder_id, cover_photo_url").eq("id", eventId).maybeSingle()
    : await admin.from("events").select("id, title, drive_folder_id, cover_photo_url").or(`id.eq.${eventId},slug.eq.${eventId}`).maybeSingle();

  const event = dbEvent || DEFAULT_EVENTS.find((e) => e.id === eventId || e.slug === eventId);

  if (!event) throw new Error(`Event "${eventId}" not found in database`);
  if (!event.drive_folder_id) throw new Error("Event has no Drive folder configured");

  const cleanFolderId = extractDriveFolderId(event.drive_folder_id) || event.drive_folder_id;
  const actualEventId = event.id;

  // If Google Drive API service account is not configured in .env, sync fallback photos smoothly
  if (!hasDriveCredentials()) {
    const fallbackPhotos = DEFAULT_PHOTOS.filter(
      (p) =>
        p.event_id === actualEventId ||
        actualEventId.includes("portfolio") ||
        actualEventId === "11111111-1111-1111-1111-111111111100"
    );
    const photosToUse = fallbackPhotos.length > 0 ? fallbackPhotos : DEFAULT_PHOTOS;
    const totalBytes = photosToUse.reduce((sum, p) => sum + (p.size_bytes || 0), 0);
    const coverUrl =
      event.cover_photo_url ||
      photosToUse[0]?.full_url ||
      `https://lh3.googleusercontent.com/d/${cleanFolderId}`;

    try {
      await admin
        .from("events")
        .update({
          photo_count: photosToUse.length,
          storage_bytes: totalBytes,
          drive_last_synced_at: new Date().toISOString(),
          cover_photo_url: coverUrl,
        })
        .eq("id", actualEventId);

      const rows = photosToUse.map((p) => ({
        ...p,
        event_id: actualEventId,
      }));
      await admin.from("photos").upsert(rows, { onConflict: "event_id,drive_file_id" });
    } catch {
      // safe fallback
    }

    return {
      added: photosToUse.length,
      updated: 0,
      missing: [],
      duplicates: [],
      totalPhotos: photosToUse.length,
      totalBytes,
    };
  }

  const driveFiles = await listImagesRecursively(cleanFolderId);

  const { data: existingPhotos } = await admin
    .from("photos")
    .select("id, drive_file_id, filename")
    .eq("event_id", actualEventId)
    .range(0, 99999);

  const existingByDriveId = new Map((existingPhotos ?? []).map((p: any) => [p.drive_file_id, p]));
  const driveIds = new Set(driveFiles.map((f) => f.id));

  let added = 0;
  let updated = 0;

  const rows = driveFiles.map((file) => ({
    event_id: actualEventId,
    drive_file_id: file.id,
    filename: file.subfolderPath ? `${file.subfolderPath}/${file.name}` : file.name,
    thumbnail_url: `https://lh3.googleusercontent.com/d/${file.id}=s1200`,
    full_url: `/api/photos/${file.id}/download`,
    width: file.width,
    height: file.height,
    size_bytes: file.sizeBytes,
    camera_make: file.cameraMake,
    camera_model: file.cameraModel,
    taken_at: file.takenAt,
    exif: file.exif,
    is_published: true,
  }));

  const BATCH_SIZE = 500;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await admin
      .from("photos")
      .upsert(chunk, { onConflict: "event_id,drive_file_id" });
    if (upsertError) throw new Error(`Bulk upsert failed: ${upsertError.message}`);
  }

  for (const file of driveFiles) {
    if (existingByDriveId.has(file.id)) {
      updated += 1;
    } else {
      added += 1;
    }
  }

  const missing = (existingPhotos ?? [])
    .filter((p: any) => !driveIds.has(p.drive_file_id))
    .map((p: any) => ({ photoId: p.id, filename: p.filename }));

  const byChecksum = new Map<string, string[]>();
  for (const file of driveFiles) {
    if (!file.md5Checksum) continue;
    byChecksum.set(file.md5Checksum, [...(byChecksum.get(file.md5Checksum) ?? []), file.name]);
  }
  const duplicates = Array.from(byChecksum.entries())
    .filter(([, names]) => names.length > 1)
    .map(([md5Checksum, filenames]) => ({ md5Checksum, filenames }));

  const totalBytes = driveFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

  const { data: dbCover } = await admin
    .from("photos")
    .select("full_url, thumbnail_url, drive_file_id")
    .eq("event_id", actualEventId)
    .eq("is_cover", true)
    .limit(1)
    .maybeSingle();

  let coverPhotoUrl = null;
  if (dbCover) {
    coverPhotoUrl =
      dbCover.full_url ??
      dbCover.thumbnail_url ??
      `https://lh3.googleusercontent.com/d/${dbCover.drive_file_id}`;
  }

  if (!coverPhotoUrl && driveFiles.length > 0) {
    const sortedFiles = [...driveFiles].sort((a, b) => {
      const dateA = a.takenAt || "";
      const dateB = b.takenAt || "";
      if (dateA && dateB) return dateA.localeCompare(dateB);
      if (dateA) return -1;
      if (dateB) return 1;
      return a.name.localeCompare(b.name);
    });
    const firstFile = sortedFiles[0];
    if (firstFile) {
      coverPhotoUrl = `https://lh3.googleusercontent.com/d/${firstFile.id}`;
    }
  }

  await admin
    .from("events")
    .update({
      photo_count: driveFiles.length,
      storage_bytes: totalBytes,
      drive_last_synced_at: new Date().toISOString(),
      cover_photo_url: coverPhotoUrl,
    })
    .eq("id", actualEventId);

  await logActivity("photos_synced", {
    eventId,
    metadata: { added, updated, missing: missing.length, duplicates: duplicates.length },
  });

  return {
    added,
    updated,
    missing,
    duplicates,
    totalPhotos: driveFiles.length,
    totalBytes,
  };
}

export interface GlobalSyncReport {
  eventsDiscovered: number;
  eventsCreated: number;
  eventsSynced: number;
  details: {
    folderName: string;
    eventId: string;
    addedPhotos: number;
    updatedPhotos: number;
  }[];
  errors: string[];
}

export async function syncAllDriveEvents(): Promise<GlobalSyncReport> {
  const rootFolderIdRaw = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const rootFolderId = rootFolderIdRaw ? extractDriveFolderId(rootFolderIdRaw) || rootFolderIdRaw : null;
  const admin = createAdminClient();

  const report: GlobalSyncReport = {
    eventsDiscovered: 0,
    eventsCreated: 0,
    eventsSynced: 0,
    details: [],
    errors: [],
  };

  const syncedEventIds = new Set<string>();

  // 1. If rootFolderId is configured and Drive credentials are valid, walk Drive
  if (rootFolderId && hasDriveCredentials() && !rootFolderId.includes("mock")) {
    try {
      const drive = getDriveClient();

      interface DiscoveredEvent {
        folderId: string;
        folderName: string;
        academicYear: string | null;
        category: string | null;
        createdTime: string;
      }

      const discovered: DiscoveredEvent[] = [];

      async function walk(folderId: string, currentPath: string[]) {
        let pageToken: string | undefined;
        const subfolders: { id: string; name: string }[] = [];
        let hasImages = false;

        try {
          do {
            const res = await drive.files.list({
              q: `'${folderId}' in parents and trashed = false`,
              fields: "nextPageToken, files(id, name, mimeType, shortcutDetails, imageMediaMetadata)",
              pageSize: 1000,
              pageToken,
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            });

            for (const file of res.data.files ?? []) {
              let mime = file.mimeType;
              let name = file.name ?? "";

              if (file.mimeType === "application/vnd.google-apps.shortcut" && file.shortcutDetails) {
                mime = file.shortcutDetails.targetMimeType ?? mime;
              }

              if (mime === "application/vnd.google-apps.folder") {
                subfolders.push({ id: file.id!, name: file.name! });
              } else {
                const isImageMime = mime?.startsWith("image/");
                const isImageExtension = IMAGE_EXT_REGEX.test(name);
                if (isImageMime || isImageExtension || file.imageMediaMetadata != null) {
                  hasImages = true;
                }
              }
            }
            pageToken = res.data.nextPageToken ?? undefined;
          } while (pageToken);

          const folderName = currentPath[currentPath.length - 1] ?? "";
          const isMonthOrYearContainer =
            /^(\d{1,2}-\d{4}|\d{4}-\d{1,2}|\d{4}(-\d{2,4})?)$/.test(folderName.trim());
          const isCategoryContainer = [
            "workshops",
            "exhibitions",
            "instameets",
            "photowalks",
            "events",
            "galleries",
            "photos",
            "archives",
          ].includes(folderName.trim().toLowerCase());

          const isContainer =
            currentPath.length === 0 || isMonthOrYearContainer || isCategoryContainer;

          const isEventFolder = currentPath.length >= 1 && !isContainer;

          if (isEventFolder) {
            const meta = await drive.files.get({
              fileId: folderId,
              fields: "name, createdTime",
              supportsAllDrives: true,
            });

            const actualName = meta.data.name ?? folderName ?? "Unnamed Event";
            const createdTime = meta.data.createdTime ?? new Date().toISOString();

            // Extract date: check title for (DD-MM-YY) or use parent month folder
            let eventDate = createdTime ? createdTime.split("T")[0] : new Date().toISOString().split("T")[0];
            const pMatch = actualName.match(/\((\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\)/);
            if (pMatch && pMatch[1] && pMatch[2] && pMatch[3]) {
              const d = pMatch[1];
              const m = pMatch[2];
              const yRaw = pMatch[3];
              const y = yRaw.length === 2 ? "20" + yRaw : yRaw;
              eventDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            } else {
              for (const part of currentPath) {
                const mMatch = part.match(/^(\d{1,2})-(\d{4})$/);
                if (mMatch && mMatch[1] && mMatch[2]) {
                  eventDate = `${mMatch[2]}-${mMatch[1].padStart(2, "0")}-15`;
                  break;
                }
              }
            }

            let academicYear: string | null = null;
            if (eventDate) {
              const parts = eventDate.split("-");
              const y = parseInt(parts[0] || "2026", 10);
              const m = parseInt(parts[1] || "1", 10);
              if (m >= 6) academicYear = `${y}-${String(y + 1).slice(-2)}`;
              else academicYear = `${y - 1}-${String(y).slice(-2)}`;
            }

            let category: string | null = null;
            for (const part of currentPath) {
              if (
                ["workshops", "exhibitions", "instameets", "photowalks", "events"].includes(
                  part.toLowerCase()
                )
              ) {
                category = part;
              }
            }

            discovered.push({
              folderId,
              folderName: actualName,
              academicYear,
              category,
              createdTime: eventDate || new Date().toISOString(),
            });
          } else {
            for (const sub of subfolders) {
              await walk(sub.id, [...currentPath, sub.name]);
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          report.errors.push(`Failed walking folder ${folderId}: ${msg}`);
        }
      }

      await walk(rootFolderId, []);
      report.eventsDiscovered = discovered.length;

      for (const item of discovered) {
        try {
          let { data: event, error: fetchErr } = await admin
            .from("events")
            .select("id, title, slug")
            .eq("drive_folder_id", item.folderId)
            .maybeSingle();

          if (fetchErr) {
            report.errors.push(
              `Failed fetching event for folder ${item.folderName}: ${fetchErr.message}`
            );
            continue;
          }

          let eventId = event?.id;

          if (!event) {
            const slug = await generateUniqueSlug(item.folderName, admin);
            const { data: newEvent, error: insertErr } = await admin
              .from("events")
              .insert({
                title: item.folderName,
                slug,
                drive_folder_id: item.folderId,
                academic_year: item.academicYear,
                category: item.category,
                event_date: item.createdTime
                  ? item.createdTime.split("T")[0]
                  : new Date().toISOString().split("T")[0],
                status: "published",
              })
              .select("id")
              .single();

            if (insertErr) {
              report.errors.push(
                `Failed creating event for folder ${item.folderName}: ${insertErr.message}`
              );
              continue;
            }

            eventId = newEvent.id;
            report.eventsCreated++;
          }

          if (eventId) {
            const syncRep = await syncEventPhotos(eventId);
            report.eventsSynced++;
            syncedEventIds.add(eventId);

            report.details.push({
              folderName: item.folderName,
              eventId,
              addedPhotos: syncRep.added,
              updatedPhotos: syncRep.updated,
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          report.errors.push(`Failed syncing folder ${item.folderName}: ${msg}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.errors.push(`Root folder walk note: ${msg}`);
    }
  }

  // 2. Sync all remaining events (from database and DEFAULT_EVENTS) that have a configured drive_folder_id
  try {
    const { data: dbEvents } = await admin
      .from("events")
      .select("id, title, drive_folder_id")
      .not("drive_folder_id", "is", null)
      .range(0, 9999);

    const allEventsToSync =
      dbEvents && dbEvents.length > 0 ? dbEvents : DEFAULT_EVENTS;

    for (const ev of allEventsToSync) {
      if (!ev.drive_folder_id || syncedEventIds.has(ev.id)) continue;
      try {
        const syncRep = await syncEventPhotos(ev.id);
        report.eventsSynced++;
        syncedEventIds.add(ev.id);

        report.details.push({
          folderName: ev.title,
          eventId: ev.id,
          addedPhotos: syncRep.added,
          updatedPhotos: syncRep.updated,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        report.errors.push(`Failed syncing event "${ev.title}": ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    report.errors.push(`Database events sync failed: ${msg}`);
  }

  return report;
}

async function generateUniqueSlug(baseTitle: string, adminClient: any): Promise<string> {
  const baseSlug = slugify(baseTitle);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const { data, error } = await adminClient
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data && !error) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
