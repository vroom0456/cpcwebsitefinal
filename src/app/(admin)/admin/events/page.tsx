import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";
import { getDashboardUser } from "@/lib/auth/require-admin";
import { AdminEventsListClient } from "@/components/admin/admin-events-list-client";

export default async function AdminEventsPage() {
  const { isAdmin } = await getDashboardUser();
  const supabase = await createClient();
  const { data: eventsData } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const events = (eventsData ?? []) as Event[];

  return <AdminEventsListClient events={events} isAdmin={isAdmin} />;
}
