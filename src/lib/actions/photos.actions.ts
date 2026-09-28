"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/services/activity-logs.service";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function revalidateAllPublicAndAdmin(eventId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/events");
  revalidatePath("/portfolio");
  revalidatePath("/archive");
  revalidatePath("/timeline");
  revalidatePath("/admin/events");
  revalidatePath("/admin/gallery");
  if (eventId) {
    revalidatePath(`/admin/gallery/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath(`/gallery/${eventId}`);
  }
}

async function resolveEventUuid(supabase: any, eventIdOrSlug: string): Promise<string> {
  if (UUID_REGEX.test(eventIdOrSlug)) return eventIdOrSlug;
  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventIdOrSlug)
    .maybeSingle();
  return data?.id || eventIdOrSlug;
}

export async function setPhotoPublished(photoId: string, eventId: string, isPublished: boolean) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const actualId = await resolveEventUuid(supabase, eventId);

    const { error } = await supabase
      .from("photos")
      .update({ is_published: isPublished })
      .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`);

    if (error) console.warn("setPhotoPublished error:", error.message);
    revalidateAllPublicAndAdmin(actualId);
  } catch (err) {
    console.warn("setPhotoPublished exception:", err);
  }
}

export async function setBatchPhotosPublished(photoIds: string[], eventId: string, isPublished: boolean) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    if (!photoIds || photoIds.length === 0) return;

    const supabase = createAdminClient();
    const actualId = await resolveEventUuid(supabase, eventId);

    const { error } = await supabase
      .from("photos")
      .update({ is_published: isPublished })
      .in("id", photoIds);

    if (error) console.warn("setBatchPhotosPublished error:", error.message);
    revalidateAllPublicAndAdmin(actualId);
  } catch (err) {
    console.warn("setBatchPhotosPublished exception:", err);
  }
}

export async function deletePhoto(photoId: string, eventId: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const actualId = await resolveEventUuid(supabase, eventId);

    const { error } = await supabase
      .from("photos")
      .delete()
      .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`);

    if (error) console.warn("deletePhoto error:", error.message);
    revalidateAllPublicAndAdmin(actualId);
  } catch (err) {
    console.warn("deletePhoto exception:", err);
  }
}

export async function setCoverFromPhoto(eventId: string, photoId: string, photoUrl: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const actualId = await resolveEventUuid(supabase, eventId);

    // Reset old cover photos
    await supabase.from("photos").update({ is_cover: false }).eq("event_id", actualId);
    
    // Set new cover photo flag in photos table
    const { error: photoError } = await supabase
      .from("photos")
      .update({ is_cover: true })
      .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`);
    if (photoError) console.warn("setCoverFromPhoto photoError:", photoError.message);

    // Update cover_photo_url on event by UUID OR Slug
    const { error: eventError } = UUID_REGEX.test(eventId)
      ? await supabase.from("events").update({ cover_photo_url: photoUrl }).eq("id", eventId)
      : await supabase.from("events").update({ cover_photo_url: photoUrl }).or(`id.eq.${actualId},slug.eq.${eventId}`);

    if (eventError) console.warn("setCoverFromPhoto eventError:", eventError.message);

    await logActivity("cover_changed", { eventId: actualId }).catch(() => {});
    revalidateAllPublicAndAdmin(actualId);
    if (eventId !== actualId) {
      revalidateAllPublicAndAdmin(eventId);
    }
  } catch (err) {
    console.warn("setCoverFromPhoto exception:", err);
  }
}

export async function setPhotoTagAction(
  photoId: string,
  eventId: string,
  tagKey: "is_group_photo" | "is_chief_guest",
  tagValue: boolean
) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return false;

    const supabase = createAdminClient();
    const actualId = await resolveEventUuid(supabase, eventId);

    // Fetch existing photo exif
    const { data: photo } = await supabase
      .from("photos")
      .select("exif, id, drive_file_id")
      .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`)
      .maybeSingle();

    const existingExif = (photo?.exif as Record<string, any>) || {};
    const updatedExif = { ...existingExif, [tagKey]: tagValue };

    // Try updating direct column & exif JSONB
    const updatePayload: Record<string, any> = {
      exif: updatedExif,
      [tagKey]: tagValue,
    };

    let { error } = await supabase
      .from("photos")
      .update(updatePayload)
      .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`);

    if (error && (error.message.includes("column") || error.code === "PGRST204")) {
      // Fallback to updating only exif JSONB if direct column is missing
      const fallbackRes = await supabase
        .from("photos")
        .update({ exif: updatedExif })
        .or(`id.eq.${photoId},drive_file_id.eq.${photoId}`);
      error = fallbackRes.error;
    }

    if (error) {
      console.warn("setPhotoTagAction error:", error.message);
      return false;
    }
    revalidateAllPublicAndAdmin(actualId);
    return true;
  } catch (err) {
    console.warn("setPhotoTagAction exception:", err);
    return false;
  }
}
