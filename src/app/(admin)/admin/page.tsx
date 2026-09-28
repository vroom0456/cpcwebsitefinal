import Link from "next/link";
import Image from "next/image";
import { getClubAnalytics, getMonthlyUploads } from "@/lib/services/analytics.service";
import { createClient } from "@/lib/supabase/server";
import { formatBytes, coverPhotoSrc } from "@/lib/utils";
import { Calendar, Camera, Eye, HardDrive, Users, Plus, RefreshCw, Sparkles, ExternalLink, Edit3, Image as ImageIcon, ArrowUpRight, TrendingUp } from "lucide-react";
import type { Event } from "@/types/database";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [club, uploads, eventsResult, membersCountResult] = await Promise.all([
    getClubAnalytics(),
    getMonthlyUploads().catch(() => []),
    supabase.from("events").select("*").order("created_at", { ascending: false }).limit(10).then((res: any) => res, () => ({ data: [], error: null })),
    supabase.from("members").select("id", { count: "exact" }).eq("status", "active").then((res: any) => res, () => ({ count: 0, data: null, error: null })),
  ]);

  const events = (eventsResult.data ?? []) as Event[];
  const activeMembersCount = membersCountResult?.count ?? 0;

  const cards = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      sub: `${events.filter(e => e.status === "published").length} Published`,
      accent: "rgba(157,94,229,0.15)",
      border: "rgba(157,94,229,0.25)",
      iconColor: "#C084FC",
    },
    {
      label: "Total Storage Used",
      value: formatBytes(club?.storage_used_bytes ?? 0),
      icon: HardDrive,
      sub: `${club?.total_photos ?? 0} Sync'd Photos`,
      accent: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.2)",
      iconColor: "#60a5fa",
    },
    {
      label: "Gallery Views",
      value: club?.total_views?.toLocaleString() ?? "0",
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
      sub: "Core Committee & Photographers",
      accent: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      iconColor: "#fbbf24",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="pb-6 border-b border-purple-500/15 animate-section-enter opacity-0">
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.label}
              className="relative rounded-2xl p-5 space-y-4 overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-default animate-section-enter opacity-0"
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
      <div className="rounded-2xl overflow-hidden animate-section-enter opacity-0"
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
                {["Event Title", "Status", "Academic Year", "Photos", "Actions"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] ${i === 4 ? "text-right" : ""}`}
                    style={{ color: "rgba(248,245,251,0.35)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const cover = coverPhotoSrc(event.cover_photo_url);
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
                            <Image src={cover} alt={event.title} fill unoptimized className="object-cover group-hover/link:scale-105 transition-transform" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Camera size={14} className="text-purple-400/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover/link:text-[#C084FC] transition-colors">{event.title}</p>
                          <p className="text-[10px] font-mono text-white/30">
                            {event.slug}
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
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(248,245,251,0.45)" }}>
                      {event.academic_year || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(157,94,229,0.8)" }}>
                      {event.photo_count}P
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {[
                          { href: `/admin/events/${event.id}`, icon: ImageIcon, title: "Manage Event & Gallery" },
                          { href: `/gallery/${event.id}`, icon: ExternalLink, title: "View Live Public Page", target: "_blank" },
                        ].map(({ href, icon: Icon, title, target }) => (
                          <Link
                            key={href}
                            href={href}
                            target={target}
                            className="p-1.5 rounded-lg transition-all duration-150 hover:scale-[1.08] text-white/35 hover:bg-[rgba(157,94,229,0.1)] hover:text-[rgba(192,132,252,0.9)]"
                            title={title}
                          >
                            <Icon size={13} />
                          </Link>
                        ))}
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
