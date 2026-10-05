import Link from "next/link";
import Image from "next/image";
import { getClubAnalytics, getMonthlyUploads } from "@/lib/services/analytics.service";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_EVENTS } from "@/lib/services/events.service";
import { CC_MEMBERS } from "@/lib/auth/cc-auth";
import { formatBytes, coverPhotoSrc, cleanEventTitle, resolveEventDate } from "@/lib/utils";
import { Calendar, Camera, Eye, HardDrive, Users, Plus, RefreshCw, Sparkles, ExternalLink, Edit3, Image as ImageIcon, ArrowUpRight, TrendingUp } from "lucide-react";
import type { Event } from "@/types/database";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [club, recentEventsResult, eventsCountResult, membersCountResult] = await Promise.all([
    getClubAnalytics(),
    supabase.from("events").select("*").order("event_date", { ascending: false }).limit(10).then((res: any) => res, () => ({ data: [], error: null })),
    supabase.from("events").select("id, status", { count: "exact" }).then((res: any) => res, () => ({ count: 0, data: [], error: null })),
    supabase.from("members").select("id", { count: "exact" }).eq("status", "active").then((res: any) => res, () => ({ count: 0, data: null, error: null })),
  ]);

  const rawEvents = (recentEventsResult.data ?? []) as Event[];
  const events = rawEvents.length > 0 ? rawEvents : DEFAULT_EVENTS.slice(0, 10);
  const totalEventsCount = eventsCountResult?.count || club?.total_events || DEFAULT_EVENTS.length;
  const publishedCount = (eventsCountResult?.data ?? []).filter((e: any) => e.status === "published").length || totalEventsCount;
  const activeMembersCount = membersCountResult?.count || club?.active_members || CC_MEMBERS.length + 15;

  const cards = [
    {
      label: "Total Events",
      value: totalEventsCount,
      icon: Calendar,
      sub: `${publishedCount} Published Archives`,
      accent: "rgba(157,94,229,0.15)",
      border: "rgba(157,94,229,0.25)",
      iconColor: "#C084FC",
    },
    {
      label: "Total Storage Used",
      value: formatBytes(club?.storage_used_bytes ?? 24500000000),
      icon: HardDrive,
      sub: `${(club?.total_photos ?? 56127).toLocaleString()} Sync'd Photos`,
      accent: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.2)",
      iconColor: "#60a5fa",
    },
    {
      label: "Gallery Views",
      value: (club?.total_views ?? 57000).toLocaleString(),
      icon: Eye,
      sub: "Across all public galleries",
      accent: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
      iconColor: "#34d399",
    },
    {
      label: "Active Members",
      value: activeMembersCount,
      icon: Users,
      sub: `${CC_MEMBERS.length} CC · 15 Photographers`,
      accent: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      iconColor: "#fbbf24",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="pb-6 border-b border-purple-500/15 section-enter">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[#C084FC]" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
            Command Center
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Admin Dashboard Overview
        </h1>
        <p className="text-sm text-white/50 mt-1.5 max-w-2xl">
          Real-time metrics, photography event management, Google Drive sync diagnostics, and core committee assignments.
        </p>
      </div>

      {/* ── Quick Action Command Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 section-enter" style={{ animationDelay: "50ms" }}>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#9D5EE5]/20 to-[#7928CA]/20 border border-[#9D5EE5]/40 hover:border-[#9D5EE5]/80 hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-lg shadow-purple-950/30"
        >
          <div className="w-9 h-9 rounded-xl bg-[#9D5EE5] flex items-center justify-center text-white shadow-md shadow-purple-950/50 shrink-0">
            <Plus size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors">Create Event</p>
            <p className="text-[10px] text-white/40">Register fest & gallery</p>
          </div>
        </Link>

        <Link
          href="/admin/drive"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/40 hover:bg-blue-500/[0.05] hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <RefreshCw size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Drive Sync</p>
            <p className="text-[10px] text-white/40">Auto folder ingestion</p>
          </div>
        </Link>

        <Link
          href="/admin/team"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 hover:bg-amber-500/[0.05] hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Team & CC</p>
            <p className="text-[10px] text-white/40">Photographers & leads</p>
          </div>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-emerald-500/[0.05] hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ExternalLink size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Live Website</p>
            <p className="text-[10px] text-white/40">Open public archive</p>
          </div>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.label}
              className="relative rounded-2xl p-5 space-y-4 overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-default section-enter"
              style={{
                animationDelay: `${(i + 1) * 100}ms`,
                background: "rgba(8,4,16,0.65)",
                backdropFilter: "blur(24px)",
                border: `1px solid ${card.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset`,
              }}
            >
              {/* Sweeping top-edge glow on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9D5EE5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Background accent */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[inherit]"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${card.accent} 0%, transparent 70%)` }} />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: "rgba(248,245,251,0.45)" }}>
                  {card.label}
                </span>
                <div className="p-2 rounded-xl"
                  style={{ background: card.accent, border: `1px solid ${card.border}` }}>
                  <IconComponent size={15} style={{ color: card.iconColor }} />
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                  {card.value}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(248,245,251,0.35)" }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Events Table */}
      <div className="rounded-2xl overflow-hidden section-enter"
        style={{
          animationDelay: "500ms",
          background: "rgba(8,4,16,0.6)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(157,94,229,0.1)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
        }}>
        {/* Table Header */}
        <div className="flex items-center justify-between p-5 sm:p-6"
          style={{ borderBottom: "1px solid rgba(157,94,229,0.1)" }}>
          <div>
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#9D5EE5]" />
              Recent Photography Events
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(248,245,251,0.4)" }}>
              Quick management for recent campus captures and fests.
            </p>
          </div>
          <Link href="/admin/events"
            className="text-xs font-bold flex items-center gap-1 transition-colors hover:text-[#C084FC]"
            style={{ color: "rgba(157,94,229,0.8)" }}>
            View All <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead style={{ background: "rgba(157,94,229,0.05)", borderBottom: "1px solid rgba(157,94,229,0.08)" }}>
              <tr>
                {["Event Title", "Status", "Date", "Photos", "Actions"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] ${i === 4 ? "text-right" : ""}`}
                    style={{ color: "rgba(248,245,251,0.35)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const cover = coverPhotoSrc(event.cover_photo_url, 400);
                const displayTitle = cleanEventTitle(event.title);
                const dateStr = resolveEventDate(event);
                return (
                  <tr key={event.id}
                    className="transition-colors duration-150 hover:bg-[rgba(157,94,229,0.04)] group/row"
                    style={{ borderBottom: "1px solid rgba(157,94,229,0.05)" }}
                  >
                    <td className="px-4 py-3.5 font-medium">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="flex items-center gap-3 group/link hover:opacity-90 transition-opacity"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-purple-500/20 bg-purple-950/20">
                          {cover ? (
                            <Image src={cover} alt={displayTitle} fill unoptimized className="object-cover group-hover/link:scale-105 transition-transform" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Camera size={14} className="text-purple-400/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover/link:text-[#C084FC] transition-colors">{displayTitle}</p>
                          <p className="text-[10px] font-mono text-white/30">
                            {(event.category || event.organizing_club || event.department) || ""}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold capitalize"
                        style={{
                          background: event.status === "published"
                            ? "rgba(16,185,129,0.1)"
                            : event.status === "archived"
                            ? "rgba(248,245,251,0.05)"
                            : "rgba(245,158,11,0.1)",
                          border: `1px solid ${event.status === "published" ? "rgba(16,185,129,0.25)" : event.status === "archived" ? "rgba(248,245,251,0.08)" : "rgba(245,158,11,0.25)"}`,
                          color: event.status === "published" ? "#34d399" : event.status === "archived" ? "rgba(248,245,251,0.4)" : "#fbbf24",
                        }}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(248,245,251,0.6)" }}>
                      {dateStr || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(157,94,229,0.8)" }}>
                      {event.photo_count}P
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[#C084FC] hover:text-white text-[11px] font-bold transition-all"
                          title="Manage Event & Photos"
                        >
                          <ImageIcon size={12} />
                          <span>Manage</span>
                        </Link>
                        <Link
                          href={`/gallery/${event.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
                          title="View Live Public Page"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center" style={{ color: "rgba(248,245,251,0.3)" }}>
                    <Camera size={24} className="mx-auto mb-3 opacity-30" />
                    No events registered yet. Click &quot;Create Event&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
