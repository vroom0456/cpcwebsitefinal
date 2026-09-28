import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Clock, Database, RefreshCw, Settings, ShieldCheck } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [eventsResult, photosResult] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, drive_last_synced_at, updated_at, photo_count")
      .order("updated_at", { ascending: false })
      .limit(10)
      .then((res: any) => res, () => ({ data: [] })),
    supabase
      .from("photos")
      .select("id, filename, created_at, is_published, is_cover, event_id")
      .order("created_at", { ascending: false })
      .limit(10)
      .then((res: any) => res, () => ({ data: [] })),
  ]);

  const events = eventsResult.data ?? [];
  const photos = photosResult.data ?? [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="text-[#C084FC]" size={22} /> Settings &amp; System Audit Logs
        </h1>
        <p className="text-xs text-white/50 mt-1">
          App environment configuration, database stats, and recent Google Drive sync history.
        </p>
      </div>

      {/* Application Config Box */}
      <div className="rounded-2xl glass-card border border-purple-500/20 p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#C084FC]" /> System Environment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-purple-500/15">
          <div className="p-3 rounded-xl glass border border-purple-500/20">
            <span className="text-white/40 block text-[10px] uppercase font-bold">App Production URL</span>
            <span className="font-mono text-white text-xs font-semibold">{process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}</span>
          </div>
          <div className="p-3 rounded-xl glass border border-purple-500/20">
            <span className="text-white/40 block text-[10px] uppercase font-bold">Google Drive Engine</span>
            <span className="font-mono text-emerald-300 text-xs font-semibold">Active · Auto Folder Walk Engine</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drive Sync Activity Log */}
        <div className="rounded-2xl glass-card border border-purple-500/20 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
            <RefreshCw className="h-4 w-4 text-[#C084FC]" />
            <h2 className="font-display text-sm font-bold text-white">Recent Drive Sync History</h2>
          </div>

          <div className="space-y-2.5">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-start justify-between text-xs p-3 rounded-xl glass border border-white/5">
                <div>
                  <p className="font-bold text-white text-xs">{event.title}</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">
                    {event.photo_count} photos cataloged
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <Clock size={10} />
                    {event.drive_last_synced_at
                      ? new Date(event.drive_last_synced_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Synced"}
                  </span>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-xs text-white/40 text-center py-4">No recent sync activity logged.</p>
            )}
          </div>
        </div>

        {/* Database & Photo Activity Log */}
        <div className="rounded-2xl glass-card border border-purple-500/20 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-purple-500/15 pb-3">
            <Database className="h-4 w-4 text-purple-400" />
            <h2 className="font-display text-sm font-bold text-white">Recent Photo Catalog Events</h2>
          </div>

          <div className="space-y-2.5">
            {photos.map((photo: any) => (
              <div key={photo.id} className="flex items-start justify-between text-xs p-3 rounded-xl glass border border-white/5">
                <div className="space-y-0.5 max-w-[65%]">
                  <p className="font-bold text-white truncate text-xs">{photo.filename}</p>
                  <div className="flex items-center gap-1.5">
                    {photo.is_cover && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${photo.is_published ? "text-emerald-300 bg-emerald-500/20 border border-emerald-500/40" : "text-white/50 bg-white/10"}`}>
                      {photo.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-white/40">
                  {new Date(photo.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <p className="text-xs text-white/40 text-center py-4">No photo catalog events recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
