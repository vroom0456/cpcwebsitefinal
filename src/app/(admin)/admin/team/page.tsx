import { getMembers } from "@/lib/services/members.service";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TeamManagerClient } from "@/components/admin/team-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  await requireAdmin();
  const members = await getMembers();

  return <TeamManagerClient initialMembers={members} />;
}
