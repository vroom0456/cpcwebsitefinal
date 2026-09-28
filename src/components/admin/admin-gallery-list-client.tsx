"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search, X, Sparkles, Camera, FolderOpen, Edit3,
  SlidersHorizontal, ChevronDown, Check, ExternalLink,
} from "lucide-react";
import { coverPhotoSrc, cn } from "@/lib/utils";
import type { Event } from "@/types/database";

interface AdminGalleryListClientProps {
  events: Event[];
  isAdmin?: boolean;
}

interface YearGroup {
  year: string;
  events: Event[];
}

function groupByYear(events: Event[]): YearGroup[] {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const year = e.event_date
      ? String(new Date(e.event_date + "T00:00:00").getFullYear())
      : "Undated";
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

export function AdminGalleryListClient({ events, isAdmin }: AdminGalleryListClientProps) {
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
              Media Hub
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Gallery Management
          </h1>
          <p className="text-xs text-white/45 mt-1">
            {events.length} {events.length === 1 ? "gallery" : "galleries"} · Open any event to manage published photos, set cover photos, and toggle visibility.
          </p>
        </div>
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
            placeholder="Search galleries by event title, category, venue…"
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
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showFilters && "rotate-180")} />
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
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
          {filteredEvents.length} {filteredEvents.length === 1 ? "gallery" : "galleries"}
          {hasActiveFilters && " matching filters"}
        </p>
      </div>

      {/* ── Gallery Grid ── */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Camera size={32} className="text-white/10" />
          <p className="text-white/50 text-sm font-medium">
            {hasActiveFilters ? "No galleries match your search" : "No event galleries yet"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="mt-1 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-[#C084FC] font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
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
                  {group.events.length} {group.events.length === 1 ? "gallery" : "galleries"}
                </span>
              </div>

              {/* Gallery cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "4%" }}
                    transition={{ duration: 0.45, ease: EASE, delay: (i % 3) * 0.06 }}
                  >
                    <GalleryCard event={event} isAdmin={isAdmin} priority={i < 3} />
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

// ── Gallery Card ─────────────────────────────────────────────────────
function GalleryCard({
  event,
  isAdmin,
  priority,
}: {
  event: Event;
  isAdmin?: boolean;
  priority?: boolean;
}) {
  const cover = event.cover_photo_url ? coverPhotoSrc(event.cover_photo_url, 600) : null;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/[0.18] bg-[#0C0716] transition-all duration-400 hover:shadow-[0_20px_60px_-15px_rgba(157,94,229,0.25)]">
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0C0716]">
        {cover ? (
          <Image
            src={cover}
            alt={event.title}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-white/10" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0716]/70 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border",
              event.status === "published"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : event.status === "archived"
                ? "bg-white/10 border-white/20 text-white/50"
                : "bg-amber-500/20 border-amber-500/30 text-amber-300"
            )}
          >
            {event.status}
          </span>
        </div>

        {/* Photo count */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-white/80 bg-black/50 backdrop-blur-md border border-white/[0.08]">
            {event.photo_count ?? 0} photos
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-[14px] text-white group-hover:text-[#C084FC] transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">
            {event.category || "General"} · {event.academic_year || ""}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
          <Link
            href={`/admin/gallery/${event.id}`}
            className="flex-1 py-2 rounded-xl btn-primary-glow text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <FolderOpen size={13} /> Open Gallery
          </Link>
          {isAdmin && (
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-purple-500/30 transition-all"
              title="Edit Event Details"
            >
              <Edit3 size={13} />
            </Link>
          )}
          <Link
            href={`/gallery/${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-purple-500/30 transition-all"
            title="View Public Gallery"
          >
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
