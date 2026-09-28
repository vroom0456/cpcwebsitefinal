"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/services/activity-logs.service";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

type TeamRole =
  | "photographyTeam"
  | "postProcessingTeam"
  | "photographyCoreCommittee"
  | "postProcessingCoreCommittee";

const TABLE_BY_ROLE: Record<TeamRole, string> = {
  photographyTeam: "event_photography_team",
  postProcessingTeam: "event_post_processing_team",
  photographyCoreCommittee: "event_photography_core_committee",
  postProcessingCoreCommittee: "event_post_processing_core_committee",
};

export async function setEventTeamRole(eventId: string, role: TeamRole, memberIds: string[]) {
  try {
    const auth = await requireCoreCommittee();
    if (!auth.ok) return;

    const table = TABLE_BY_ROLE[role];
    const supabase = createAdminClient();

    const { error: deleteError } = await supabase.from(table).delete().eq("event_id", eventId);
    if (deleteError) {
      console.warn(`setEventTeamRole delete error on ${table}:`, deleteError.message);
    }

    if (memberIds.length > 0) {
      const { error: insertError } = await supabase
        .from(table)
        .insert(memberIds.map((member_id) => ({ event_id: eventId, member_id })));
      if (insertError) {
        console.warn(`setEventTeamRole insert error on ${table}:`, insertError.message);
      }
    }

    const isCoreCommitteeRole = role.includes("CoreCommittee");
    await logActivity(isCoreCommitteeRole ? "core_committee_updated" : "team_updated", {
      eventId,
      metadata: { role, memberCount: memberIds.length },
    }).catch(() => {});

    revalidatePath("/", "layout");
    revalidatePath("/events");
    revalidatePath("/portfolio");
    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath(`/admin/gallery/${eventId}`);
    revalidatePath(`/gallery/${eventId}`);
  } catch (err) {
    console.warn("setEventTeamRole exception:", err);
  }
}
