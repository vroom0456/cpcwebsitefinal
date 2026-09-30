import { getDashboardUser } from "@/lib/auth/require-admin";
import { getEventsAdmin } from "@/lib/services/events.service";
import { AdminEventsListClient } from "@/components/admin/admin-events-list-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminEventsPage() {
  const { isAdmin } = await getDashboardUser();
  const events = await getEventsAdmin();

  return <AdminEventsListClient events={events} isAdmin={isAdmin} />;
}
