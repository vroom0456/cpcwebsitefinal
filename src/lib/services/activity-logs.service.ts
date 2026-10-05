import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ActivityAction, ActivityLog } from "@/types/database";

export async function logActivity(
  action: ActivityAction,
  opts: { memberId?: string; eventId?: string; metadata?: Record<string, unknown> } = {}
) {
  try {
    const supabase = createAdminClient();
    await supabase.from("activity_logs").insert({
      action,
      member_id: opts.memberId ?? null,
      event_id: opts.eventId ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch {
    // Non-fatal logging failure
  }
}

export async function getRecentActivity(limit = 50): Promise<
  (ActivityLog & { member_name: string | null; event_title: string | null })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, members(name), events(title)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((log: any) => ({
    ...log,
    member_name: log.members?.name ?? null,
    event_title: log.events?.title ?? null,
  }));
}
