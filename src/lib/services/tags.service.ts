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
    if (!error && data && data.length > 0) {
      return data.map((r: any) => r.tag_id);
    }

    // Fallback: check activity_logs where event tags were recorded
    const { data: logData } = await supabase
      .from("activity_logs")
      .select("metadata")
      .eq("action", "event_tags")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logData?.metadata && Array.isArray((logData.metadata as any).tag_ids)) {
      return (logData.metadata as any).tag_ids;
    }

    return (data ?? []).map((r: any) => r.tag_id);
  } catch (err) {
    console.warn("getEventTagIds exception:", err);
    return [];
  }
}
