import { createClient } from "@/lib/supabase/server";
import { DriveSyncPanel } from "@/components/admin/drive-sync-panel";
import { GlobalDriveSync } from "@/components/admin/global-drive-sync";
import type { Event } from "@/types/database";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getEventsAdmin } from "@/lib/services/events.service";
import { Sparkles, HardDrive, RefreshCw } from "lucide-react";

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
    <div className="space-y-8 max-w-6xl">
      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-purple-500/15">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[#C084FC]" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
            Sync Engine
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Google Drive Integration
        </h1>
        <p className="text-xs text-white/50 mt-1 max-w-2xl">
          Automated folder crawling, high-resolution thumbnail generation, and bi-directional photo archive synchronization.
        </p>
      </div>

      {/* Global Sync Section */}
      <GlobalDriveSync />

      {/* Individual Event Drive Sync Panels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <HardDrive size={13} className="text-[#C084FC]" />
            <span>Event Folders ({events.length})</span>
          </h2>
        </div>

        <div className="space-y-3">
          {(events ?? []).map((event) => (
            <DriveSyncPanel key={event.id} event={event} />
          ))}
          {(!events || events.length === 0) && (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/40">
              No events found. Create an event and link its Google Drive folder ID to begin syncing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
