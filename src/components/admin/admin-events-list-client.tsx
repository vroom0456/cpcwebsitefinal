"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search, X, Plus, Edit3, ImageIcon, ExternalLink, Camera,
  Sparkles, SlidersHorizontal, ChevronDown, Calendar, Check, Trash2, MapPin, ArrowUpRight, QrCode,
} from "lucide-react";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle, cn } from "@/lib/utils";
import type { Event } from "@/types/database";
import { deleteEvent } from "@/lib/actions/events.actions";
import { ShareDialog } from "@/components/public/share-dialog";

interface AdminEventsListClientProps {
  events: Event[];
  isAdmin: boolean;
}

interface YearGroup {
  year: string;
  events: Event[];
}

function groupByYear(events: Event[]): YearGroup[] {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const resolved = resolveEventDate(e);
    const match = resolved.match(/\b(20\d{2})\b/);
    const year: string = (match && match[1]) ? match[1] : (e.event_date ? e.event_date.slice(0, 4) : "Undated");
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return Number(b) - Number(a);
    })
    .map(([year, events]) => ({ year, events }));
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function AdminEventsListClient({ events, isAdmin }: AdminEventsListClientProps) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (q.trim()) {
        const query = q.toLowerCase().trim();
        const match =
          e.title.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query) ||
          e.venue?.toLowerCase().includes(query) ||
          e.slug?.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      return true;
    });
  }, [events, q, statusFilter]);

  const yearGroups = useMemo(() => groupByYear(filteredEvents), [filteredEvents]);

  const hasActiveFilters = q || statusFilter !== "all";

  const clearAll = () => {
    setQ("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
              Event Management
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Photography Events
          </h1>
          <p className="text-xs text-white/45 mt-1">
            {events.length} registered {events.length === 1 ? "event" : "events"} · Manage galleries, edit details, and view live pages.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-primary-glow cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        )}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events by title, venue, department, category…"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#9D5EE5]/50 focus:ring-1 focus:ring-[#9D5EE5]/20 transition-all"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-medium transition-all cursor-pointer",
            showFilters
              ? "bg-[#9D5EE5]/15 border-[#9D5EE5]/40 text-white"
              : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showFilters && "rotate-180")} />
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          {/* Status filter */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {["all", "published", "draft", "archived"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1",
                    statusFilter === s
                      ? "bg-[#9D5EE5]/20 border-[#9D5EE5]/50 text-[#C084FC]"
                      : "border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
                  )}
                >
                  {statusFilter === s && <Check size={10} />}
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="self-end text-[11px] text-white/40 hover:text-white underline transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-white/35 font-mono">
          {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          {hasActiveFilters && " matching filters"}
        </p>
      </div>

      {/* ── Event Card Grid ── */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Camera size={32} className="text-white/10" />
          <p className="text-white/50 text-sm font-medium">
            {hasActiveFilters ? "No events match your search" : "No events registered yet"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="mt-1 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-[#C084FC] font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
          {!hasActiveFilters && isAdmin && (
            <Link
              href="/admin/events/new"
              className="mt-1 px-4 py-2 rounded-xl btn-primary-glow text-xs text-white font-bold"
            >
              + Create your first event
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-14">
          {yearGroups.map((group) => (
            <section key={group.year}>
              {/* Year label */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
                  {group.year}
                </h2>
                <div className="flex-1 h-px bg-white/[0.05]" />
                <span className="text-[11px] font-mono text-white/25">
                  {group.events.length} {group.events.length === 1 ? "event" : "events"}
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.1 }}
                  >
                    <AdminEventCard event={event} isAdmin={isAdmin} priority={i < 3} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Event Card (Ditto Real Website Design System & Easiest Controls) ──────
function AdminEventCard({
  event,
  priority,
}: {
  event: Event;
  isAdmin: boolean;
  priority?: boolean;
}) {
  const [showQR, setShowQR] = useState(false);
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = resolveEventDate(event);
  const displayTitle = cleanEventTitle(event.title);

  return (
    <>
      <div className="h-full flex flex-col group relative rounded-2xl bg-[#090510] border border-white/[0.08] hover:border-[#9D5EE5]/50 transition-all duration-300 shadow-xl hover:shadow-[0_16px_40px_rgba(157,94,229,0.18)] overflow-hidden">
        {/* Top Cover Media Area */}
        <Link
          href={`/admin/events/${event.id}`}
          className="relative aspect-[16/10] overflow-hidden bg-[#0A0514] block"
          title={`Manage ${displayTitle}`}
        >
          {event.cover_photo_url ? (
            <Image
              src={imgSrc}
              alt={displayTitle}
              fill
              unoptimized
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 will-change-transform"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#07030D]">
              <Camera size={32} className="text-white/15" />
            </div>
          )}

          {/* Silky dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090510] via-black/20 to-black/35 pointer-events-none z-10" />

          {/* Top badges bar (exact same as live website) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
            {/* Date Pill */}
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-white/95 shadow-md">
                <Calendar size={10} className="text-[#C084FC]" />
                <span>{dateStr}</span>
              </span>
            )}

            {/* Status & Photo count */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-md",
                  event.status === "published"
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                    : event.status === "archived"
                    ? "bg-white/10 border-white/20 text-white/50"
                    : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                )}
              >
                {event.status}
              </span>

              {event.photo_count > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-[#C084FC] shadow-md">
                  <ImageIcon size={10} className="text-[#C084FC]" />
                  <span>{event.photo_count} photos</span>
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Card Content & Details (exact same as live website) */}
        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 gap-3.5">
          <div className="space-y-2">
            {/* Category pill & Albums */}
            <div className="flex items-center justify-between gap-2 min-h-[20px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold uppercase tracking-wider text-[#C084FC] bg-[#9D5EE5]/15 border border-[#9D5EE5]/25">
                {event.category || "Campus Event"}
              </span>

              {event.subfolders && event.subfolders.length > 0 && (
                <span className="text-[10px] font-mono text-white/50">
                  {event.subfolders.length} {event.subfolders.length === 1 ? "album" : "albums"}
                </span>
              )}
            </div>

            {/* Title with locked 2-line clamp */}
            <Link
              href={`/admin/events/${event.id}`}
              className="font-display text-[15.5px] sm:text-[16.5px] font-bold leading-snug text-white hover:text-[#C084FC] transition-colors duration-200 line-clamp-2 min-h-[2.6rem] block"
            >
              {displayTitle}
            </Link>

            {/* Venue */}
            <div className="flex items-center gap-1.5 text-[11px] text-white/50 truncate">
              <MapPin size={11} className="text-[#9D5EE5] shrink-0" />
              <span className="truncate">{event.venue?.split(",")[0] || "CBIT Campus"}</span>
            </div>
          </div>

          {/* Quick Admin Controls Toolbar */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <Link
              href={`/admin/events/${event.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[#C084FC] hover:text-white text-xs font-bold transition-all"
              title="Manage Photos & Settings"
            >
              <ImageIcon size={13} />
              <span>Manage</span>
            </Link>

            {/* QR Code Generator */}
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Generate Branded QR Code"
            >
              <QrCode size={14} />
            </button>

            {/* Live Public Page */}
            <Link
              href={`/gallery/${event.id}`}
              target="_blank"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-[#C084FC] transition-all"
              title="View Public Gallery"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Branded QR Code Dialog */}
      {showQR && (
        <ShareDialog
          url={typeof window !== "undefined" ? `${window.location.origin}/gallery/${event.id}` : `https://cbitphotoclub.vercel.app/gallery/${event.id}`}
          title={displayTitle}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}
