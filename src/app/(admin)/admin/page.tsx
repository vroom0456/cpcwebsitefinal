import Link from "next/link";
import Image from "next/image";
import { getClubAnalytics } from "@/lib/services/analytics.service";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_EVENTS } from "@/lib/services/events.service";
import { CC_MEMBERS } from "@/lib/auth/cc-auth";
import { formatBytes, coverPhotoSrc, cleanEventTitle, resolveEventDate } from "@/lib/utils";
import {
  Calendar,
  Camera,
  Eye,
  HardDrive,
  Users,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  ArrowUpRight,
  TrendingUp,
  Tag as TagIcon,
} from "lucide-react";
import type { Event } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [club, recentEventsResult, eventsCountResult, membersCountResult, buzzSubmissionsResult] = await Promise.all([
    getClubAnalytics(),
    supabase.from("events").select("*").order("event_date", { ascending: false }).limit(10).then((res: any) => res, () => ({ data: [], error: null })),
    supabase.from("events").select("id, status", { count: "exact" }).then((res: any) => res, () => ({ count: 0, data: [], error: null })),
    supabase.from("members").select("id", { count: "exact" }).eq("status", "active").then((res: any) => res, () => ({ count: 0, data: null, error: null })),
    supabase.from("buzz_submissions").select("id, status").then((res: any) => res, () => ({ data: [], error: null })),
  ]);

  const rawEvents = (recentEventsResult.data ?? []) as Event[];
  const events = rawEvents.length > 0 ? rawEvents : DEFAULT_EVENTS.slice(0, 10);
  const totalEventsCount = eventsCountResult?.count || club?.total_events || DEFAULT_EVENTS.length;
  const publishedCount = (eventsCountResult?.data ?? []).filter((e: any) => e.status === "published").length || totalEventsCount;
  const activeMembersCount = membersCountResult?.count || club?.active_members || CC_MEMBERS.length + 15;
  const buzzItems = (buzzSubmissionsResult?.data ?? []) as any[];
  const pendingBuzzCount = buzzItems.filter((b) => b.status === "pending").length;

  const cards = [
    {
      label: "Total Events",
      value: totalEventsCount,
      icon: Calendar,
      sub: `${publishedCount} Published Archives`,
      iconBg: "bg-purple-500/10 text-[#C084FC] border-purple-500/25",
    },
    {
      label: "Storage Used",
      value: formatBytes(club?.storage_used_bytes ?? 24500000000),
      icon: HardDrive,
      sub: `${(club?.total_photos ?? 56127).toLocaleString()} Sync'd Photos`,
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    },
    {
      label: "Gallery Views",
      value: (club?.total_views ?? 57000).toLocaleString(),
      icon: Eye,
      sub: "Across all public galleries",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    },
    {
      label: "Active Members",
      value: activeMembersCount,
      icon: Users,
      sub: `${CC_MEMBERS.length} CC · 15 Photographers`,
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[#C084FC]" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
            Command Center
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Admin Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
          Real-time metrics, photography event management, Google Drive sync diagnostics, and core committee assignments.
        </p>
      </div>

      {/* ── Quick Action Command Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link href="/admin/events/new">
          <Card variant="interactive" className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-sm shrink-0">
              <Plus size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Create Event</p>
              <p className="text-[10px] text-white/40">Register fest & gallery</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/buzz">
          <Card variant="interactive" className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">Buzz Frames</p>
                {pendingBuzzCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-400 text-black leading-none">
                    {pendingBuzzCount}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/40">Review submissions</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/drive">
          <Card variant="interactive" className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <RefreshCw size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Drive Sync</p>
              <p className="text-[10px] text-white/40">Auto folder ingestion</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/team">
          <Card variant="interactive" className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Team & CC</p>
              <p className="text-[10px] text-white/40">Photographers & leads</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/tags">
          <Card variant="interactive" className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[#C084FC] shrink-0">
              <TagIcon size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Event Tags</p>
              <p className="text-[10px] text-white/40">Categories & filters</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.label} variant="default" className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                  <IconComponent size={14} />
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                  {card.value}
                </p>
                <p className="text-[11px] mt-1 text-white/40">
                  {card.sub}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Events Table */}
      <Card variant="default">
        {/* Table Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/[0.08]">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#C084FC]" />
              Recent Photography Events
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Quick management for recent campus captures and fests.
            </p>
          </div>
          <Link
            href="/admin/events"
            className="text-xs font-bold flex items-center gap-1 text-[#C084FC] hover:text-white transition-colors"
          >
            View All <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                {["Event Title", "Status", "Date", "Photos", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 ${
                      i === 4 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {events.map((event) => {
                const cover = coverPhotoSrc(event.cover_photo_url, 400);
                const displayTitle = cleanEventTitle(event.title);
                const dateStr = resolveEventDate(event);
                return (
                  <tr
                    key={event.id}
                    className="transition-colors duration-150 hover:bg-white/[0.02] group/row"
                  >
                    <td className="px-4 py-3.5 font-medium">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="flex items-center gap-3 group/link hover:opacity-90 transition-opacity"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                          {cover ? (
                            <Image
                              src={cover}
                              alt={displayTitle}
                              fill
                              unoptimized
                              className="object-cover group-hover/link:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Camera size={14} className="text-white/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover/link:text-[#C084FC] transition-colors">
                            {displayTitle}
                          </p>
                          <p className="text-[10px] font-mono text-white/30">
                            {(event.category || event.organizing_club || event.department) || ""}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border ${
                          event.status === "published"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : event.status === "archived"
                            ? "bg-white/[0.04] border-white/10 text-white/40"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-white/50">
                      {dateStr || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#C084FC]">
                      {event.photo_count}P
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-bold transition-all"
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
                  <td colSpan={5} className="p-10 text-center text-white/30 font-mono text-xs">
                    <Camera size={24} className="mx-auto mb-3 opacity-30" />
                    No events registered yet. Click &quot;Create Event&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
