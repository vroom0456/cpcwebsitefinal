"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

export async function createTag(name: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const { error } = await supabase.from("tags").insert({ name: name.trim() });
    if (error) console.warn("createTag error:", error.message);
    revalidatePath("/admin/tags");
  } catch (err) {
    console.warn("createTag exception:", err);
  }
}

export async function deleteTag(tagId: string) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();
    const { error } = await supabase.from("tags").delete().eq("id", tagId);
    if (error) console.warn("deleteTag error:", error.message);
    revalidatePath("/admin/tags");
  } catch (err) {
    console.warn("deleteTag exception:", err);
  }
}

export async function setEventTags(eventId: string, tagIds: string[]) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const supabase = createAdminClient();

    const { error: deleteError } = await supabase.from("event_tags").delete().eq("event_id", eventId);
    if (deleteError) console.warn("setEventTags delete error:", deleteError.message);

    if (tagIds.length > 0) {
      const { error: insertError } = await supabase
        .from("event_tags")
        .insert(tagIds.map((tag_id) => ({ event_id: eventId, tag_id })));
      if (insertError) console.warn("setEventTags insert error:", insertError.message);

      await Promise.all(
        tagIds.map((tagId) =>
          supabase.rpc("increment_tag_usage" as never, { p_tag_id: tagId } as never)
        )
      ).catch(() => {});
    }

    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath(`/gallery/${eventId}`);
    revalidatePath("/", "layout");
  } catch (err) {
    console.warn("setEventTags exception:", err);
  }
}
