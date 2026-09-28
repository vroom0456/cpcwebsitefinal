import { createClient } from "@/lib/supabase/server";
import { DriveSyncPanel } from "@/components/admin/drive-sync-panel";
import { GlobalDriveSync } from "@/components/admin/global-drive-sync";
import type { Event } from "@/types/database";
import { requireAdmin } from "@/lib/auth/require-admin";

import { getEventsAdmin } from "@/lib/services/events.service";

export const dynamic = "force-dynamic";

export default async function AdminDrivePage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, title, drive_folder_id, drive_last_synced_at, photo_count, storage_bytes")
    .order("title")
    .then((res: any) => res, () => ({ data: [] }));

  const fallbackEvents = await getEventsAdmin();
  const events = (eventsData && eventsData.length > 0 ? eventsData : fallbackEvents) as Event[];

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold">Google Drive</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Each event's <code>drive_folder_id</code> is set on its edit page. Validate a folder before
        the first sync, then re-sync whenever new photos land in Drive.
      </p>

      <GlobalDriveSync />

      <div className="space-y-3">
        {(events ?? []).map((event) => (
          <DriveSyncPanel key={event.id} event={event} />
        ))}
        {(!events || events.length === 0) && (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}
      </div>
    </div>
  );
}
