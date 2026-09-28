"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { eventFormSchema, type EventFormValues } from "@/lib/validators/event-form";
import { logActivity } from "@/lib/services/activity-logs.service";
import { requireCoreCommittee } from "@/lib/auth/require-admin";
import { slugify, extractDriveFolderId } from "@/lib/utils";
import { DEFAULT_EVENTS } from "@/lib/services/events.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function revalidateAllEventPaths(eventId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/events");
  revalidatePath("/portfolio");
  revalidatePath("/archive");
  revalidatePath("/timeline");
  revalidatePath("/admin/events");
  revalidatePath("/admin/gallery");
  if (eventId) {
    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath(`/admin/gallery/${eventId}`);
    revalidatePath(`/gallery/${eventId}`);
  }
}

export async function createEvent(values: EventFormValues) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) throw new Error(auth.message);

  const parsed = eventFormSchema.parse(values);
  const supabase = createAdminClient();

  const finalSlug = slugify(parsed.slug || parsed.title);

  const insertPayload: Record<string, any> = {
    title: parsed.title,
    slug: finalSlug,
    status: parsed.status || "draft",
    description: parsed.description || null,
    category: parsed.category || null,
    department: parsed.department || null,
    venue: parsed.venue || null,
    academic_year: parsed.academic_year || null,
    event_date: parsed.event_date || null,
    drive_folder_id: extractDriveFolderId(parsed.drive_folder_id) || parsed.drive_folder_id || null,
  };

  if (parsed.timings) {
    insertPayload.timings = parsed.timings;
  }

  let { data, error } = await supabase
    .from("events")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error && (error.message.includes("timings") || error.message.includes("column") || error.code === "PGRST204")) {
    delete insertPayload.timings;
    const retry = await supabase
      .from("events")
      .insert(insertPayload)
      .select("id")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) throw new Error(error?.message || "Failed to create event");

  await logActivity("event_created", { eventId: data.id, metadata: { title: parsed.title } });

  revalidateAllEventPaths(data.id);
  redirect(`/admin/events/${data.id}/edit`);
}

export async function updateEvent(eventId: string, values: EventFormValues) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) throw new Error(auth.message);

  const parsed = eventFormSchema.parse(values);
  const supabase = createAdminClient();

  const isUuid = UUID_REGEX.test(eventId);
  const { data: existingEvent } = isUuid
    ? await supabase.from("events").select("id, slug").eq("id", eventId).maybeSingle()
    : await supabase.from("events").select("id, slug").eq("slug", eventId).maybeSingle();

  const actualId = existingEvent?.id || eventId;
  const oldSlug = existingEvent?.slug;

  // Determine final slug - prioritize user provided slug or fallback to existing slug or title slugify
  let finalSlug = oldSlug;
  if (parsed.slug && parsed.slug.trim() !== "") {
    finalSlug = slugify(parsed.slug);
  } else if (!oldSlug && parsed.title) {
    finalSlug = slugify(parsed.title);
  }

  // Ensure slug uniqueness if slug changed
  if (finalSlug && finalSlug !== oldSlug) {
    const { data: conflict } = await supabase
      .from("events")
      .select("id")
      .eq("slug", finalSlug)
      .neq("id", actualId)
      .maybeSingle();

    if (conflict) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
  }

  const updateFields: Record<string, any> = {
    title: parsed.title,
    description: parsed.description || null,
    category: parsed.category || null,
    department: parsed.department || null,
    venue: parsed.venue || null,
    academic_year: parsed.academic_year || null,
    event_date: parsed.event_date || null,
    drive_folder_id: extractDriveFolderId(parsed.drive_folder_id) || parsed.drive_folder_id || null,
  };

  if (parsed.timings !== undefined && parsed.timings !== null) {
    updateFields.timings = parsed.timings;
  }

  if (finalSlug) {
    updateFields.slug = finalSlug;
  }

  if (parsed.status) {
    updateFields.status = parsed.status;
  }

  let { error } = await supabase
    .from("events")
    .update(updateFields)
    .eq("id", actualId);

  if (error && (error.message.includes("timings") || error.message.includes("column") || error.code === "PGRST204")) {
    delete updateFields.timings;
    const retry = await supabase
      .from("events")
      .update(updateFields)
      .eq("id", actualId);
    error = retry.error;
  }

  if (error) {
    console.warn(`updateEvent error on ${eventId}:`, error.message);
    throw new Error(error.message);
  }

  await logActivity("event_updated", { eventId: actualId, metadata: { title: parsed.title } }).catch(() => {});

  revalidateAllEventPaths(actualId);
  if (oldSlug && oldSlug !== actualId) revalidateAllEventPaths(oldSlug);
  if (finalSlug && finalSlug !== actualId) revalidateAllEventPaths(finalSlug);
}

export async function deleteEvent(eventId: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const isUuid = UUID_REGEX.test(eventId);
    const { error } = isUuid
      ? await supabase.from("events").delete().eq("id", eventId)
      : await supabase.from("events").delete().eq("slug", eventId);

    if (error) console.warn("deleteEvent error:", error.message);

    await logActivity("event_deleted", { eventId }).catch(() => {});
    revalidateAllEventPaths(eventId);
  } catch (err) {
    console.warn("deleteEvent exception:", err);
  }
}

export async function setEventCoverPhoto(eventId: string, photoUrl: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const isUuid = UUID_REGEX.test(eventId);

    const { error } = isUuid
      ? await supabase.from("events").update({ cover_photo_url: photoUrl }).eq("id", eventId)
      : await supabase.from("events").update({ cover_photo_url: photoUrl }).eq("slug", eventId);

    if (error) console.warn("setEventCoverPhoto error:", error.message);

    await logActivity("cover_changed", { eventId }).catch(() => {});
    revalidateAllEventPaths(eventId);
  } catch (err) {
    console.warn("setEventCoverPhoto exception:", err);
  }
}

export async function syncAllEventsAction() {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) throw new Error(auth.message);

    const { syncAllDriveEvents } = await import("@/lib/drive/drive.service");
    const report = await syncAllDriveEvents();
    // After syncing, fix event covers from real photo thumbnails
    await fixAllEventCoverPhotosAction();
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { ok: true, report };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Global sync failed";
    return { ok: false, error: message };
  }
}

/**
 * For every event that has photos, pick the first photo's thumbnail_url
 * as the event cover_photo_url (if the current cover is a folder ID or missing).
 */
export async function fixAllEventCoverPhotosAction() {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) throw new Error(auth.message);

    const admin = createAdminClient();

    // Get all events
    const { data: events } = await admin
      .from("events")
      .select("id, cover_photo_url")
      .range(0, 9999);

    if (!events || events.length === 0) return { ok: true, fixed: 0 };

    let fixed = 0;
    for (const event of events) {
      // Skip if already has a valid non-expired cover URL
      const hasRealCover =
        (event.cover_photo_url?.includes("lh3.googleusercontent.com/d/") && !event.cover_photo_url?.includes("drive-storage")) ||
        event.cover_photo_url?.includes("/api/drive/photo/") ||
        event.cover_photo_url?.includes("/api/photos/");

      if (hasRealCover) continue;

      // Find first published photo for this event that has a drive_file_id
      const { data: photos } = await admin
        .from("photos")
        .select("thumbnail_url, drive_file_id")
        .eq("event_id", event.id)
        .eq("is_published", true)
        .not("drive_file_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!photos || photos.length === 0) continue;

      const photo = photos[0];
      const coverUrl = photo.drive_file_id
        ? `https://lh3.googleusercontent.com/d/${photo.drive_file_id}=s1200`
        : photo.thumbnail_url;

      if (!coverUrl) continue;

      await admin
        .from("events")
        .update({ cover_photo_url: coverUrl })
        .eq("id", event.id);
      fixed++;
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin/gallery");
    revalidatePath("/events");
    return { ok: true, fixed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

