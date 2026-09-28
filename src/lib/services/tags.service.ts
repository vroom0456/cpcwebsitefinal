import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/types/database";

export async function getTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("usage_count", { ascending: false });
    if (error) {
      console.warn("getTags error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("getTags exception:", err);
    return [];
  }
}

export async function getEventTagIds(eventId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("event_tags").select("tag_id").eq("event_id", eventId);
    if (error) {
      console.warn("getEventTagIds error:", error.message);
      return [];
    }
    return (data ?? []).map((r: any) => r.tag_id);
  } catch (err) {
    console.warn("getEventTagIds exception:", err);
    return [];
  }
}
