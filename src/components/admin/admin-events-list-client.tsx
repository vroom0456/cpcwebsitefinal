"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus, ImageIcon, Camera,
  Sparkles, Calendar, MapPin,
} from "lucide-react";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle } from "@/lib/utils";
import type { Event } from "@/types/database";
import { EventFilters } from "@/components/public/event-filters";

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
    const year: string = match && match[1] ? match[1] : e.event_date ? e.event_date.slice(0, 4) : "2026";
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
  const [venue, setVenue] = useState("");
  const [organizingClub, setOrganizingClub] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Extract filter sets for the 4 filters: Venue, Club, Month, Year
  const { venues, organizingClubs, years } = useMemo(() => {
    const vSet = new Set<string>();
    const cSet = new Set<string>();
    const ySet = new Set<string>();

    // Standard CBIT Venues
    [
      "Open Air Theatre (OAT)",
      "Assembly Hall",
      "E-Block Auditorium",
      "N-Block Seminar Hall",
      "D-Block Training Center",
      "Main Campus",
      "Sports Ground",
    ].forEach((v) => vSet.add(v));

    // Standard CBIT Clubs & Departments
    [
      "CBIT Photography Club",
      "Chhaaya",
      "COSC",
      "IEEE CBIT",
      "CSI",
      "NSS CBIT",
      "EDC",
      "Communicando",
      "Prahethi Racing",
      "CyberFest / DDC",
      "ECE Department",
      "CSE Department",
      "IT Department",
    ].forEach((c) => cSet.add(c));

    events.forEach((e) => {
      if (e.venue) vSet.add(e.venue.trim());
      if (e.organizing_club && e.organizing_club !== "featured_home") {
        cSet.add(e.organizing_club.trim());
      }
      if (e.department) cSet.add(e.department.trim());

      const d = e.event_date || "";
      const match = d.match(/\b(20\d{2})\b/);
      if (match && match[1]) ySet.add(match[1]);
    });

    ["2026", "2025", "2024", "2023"].forEach((y) => ySet.add(y));

    return {
      venues: Array.from(vSet).sort(),
      organizingClubs: Array.from(cSet).sort(),
      years: Array.from(ySet).sort().reverse(),
    };
  }, [events]);

  const clearFilters = () => {
    setQ("");
    setVenue("");
    setOrganizingClub("");
    setMonth("");
    setYear("");
  };

  const hasActiveFilters = Boolean(q || venue || organizingClub || month || year);

  // Filter events and arrange strictly by latest first
  const filteredEvents = useMemo(() => {
    const list = events.filter((e) => {
      if (q.trim()) {
        const query = q.toLowerCase().trim();
        const match =
          e.title.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query) ||
          e.venue?.toLowerCase().includes(query) ||
          e.organizing_club?.toLowerCase().includes(query) ||
          e.slug?.toLowerCase().includes(query);
        if (!match) return false;
      }

      if (venue) {
        if (!e.venue || !e.venue.toLowerCase().includes(venue.toLowerCase())) return false;
      }

      if (organizingClub) {
        const clubMatch =
          e.organizing_club?.toLowerCase().includes(organizingClub.toLowerCase()) ||
          e.department?.toLowerCase().includes(organizingClub.toLowerCase());
        if (!clubMatch) return false;
      }

      if (year) {
        const d = e.event_date || "";
        if (!d.includes(year)) return false;
      }

      if (month) {
        const mPadded = month.padStart(2, "0");
        const d = e.event_date || "";
        const t = e.title;
        const matchIso = d.includes(`-${mPadded}-`) || d.endsWith(`-${mPadded}`);
        const matchTitle =
          t.includes(`-${mPadded}-`) ||
          t.includes(`/${mPadded}/`) ||
          t.includes(`-${month}-`) ||
          t.includes(`/${month}/`);

        if (!matchIso && !matchTitle) return false;
      }

      return true;
    });

    // Arrange strictly by date latest first
    list.sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));
    return list;
  }, [events, q, venue, organizingClub, month, year]);

  const yearGroups = useMemo(() => groupByYear(filteredEvents), [filteredEvents]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80 font-mono">
              Admin Console · Event Operations
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            {events.length} registered {events.length === 1 ? "event" : "events"} · Unified with live public archive styling and controls.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-primary-glow cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        )}
      </div>

      {/* ── 4 Required Filters: Venue, Organising Club, Month, Year ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090512] border border-white/[0.08] shadow-xl">
        <EventFilters
          venues={venues}
          organizingClubs={organizingClubs}
          years={years}
          events={events}
          q={q}
          setQ={setQ}
          venue={venue}
          setVenue={setVenue}
          organizingClub={organizingClub}
          setOrganizingClub={setOrganizingClub}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
          clearFilters={clearFilters}
        />
      </div>

      {/* ── Results count & quick clear ── */}
      <div className="flex items-center justify-between text-xs text-white/40 font-mono">
        <p>
          Showing {filteredEvents.length} of {events.length} events
          {hasActiveFilters && " (filtered)"}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#C084FC] hover:text-white underline cursor-pointer transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* ── Event Card Grid (Grouped by Year, Latest First) ── */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 glass-card rounded-2xl p-8 border border-white/[0.06]">
          <Camera size={36} className="text-[#C084FC]/30" />
          <p className="text-white/60 text-sm font-medium">
            {hasActiveFilters ? "No events match the selected filters" : "No events registered yet"}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-1 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-[#C084FC] font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          ) : isAdmin ? (
            <Link
              href="/admin/events/new"
              className="mt-1 px-4 py-2 rounded-xl btn-primary-glow text-xs text-white font-bold"
            >
              + Create your first event
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {yearGroups.map((group) => (
            <section key={group.year}>
              {/* Year label */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#C084FC]">
                  {group.year}
                </h2>
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-xs font-mono text-white/30">
                  {group.events.length} {group.events.length === 1 ? "event" : "events"}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-5%" }}
                    transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.08 }}
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
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = resolveEventDate(event);
  const displayTitle = cleanEventTitle(event.title);
  const cleanVenue = event.venue?.split(",")[0] || "CBIT Campus";

  return (
    <Link
      href={`/admin/events/${event.id}`}
      className="h-full flex flex-col group relative rounded-2xl bg-[#090510] border border-white/[0.08] hover:border-[#9D5EE5]/50 transition-all duration-300 shadow-xl hover:shadow-[0_16px_40px_rgba(157,94,229,0.18)] overflow-hidden cursor-pointer"
      title={`Manage ${displayTitle}`}
    >
      {/* Larger Cover Media Area (No dark vignette over faces) */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[#0A0514] block">
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

        {/* Crisp photo count tag top-right */}
        {event.photo_count > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-white/95 shadow-md">
              <ImageIcon size={10} className="text-[#C084FC]" />
              <span>{event.photo_count} photos</span>
            </span>
          </div>
        )}
      </div>

      {/* Clean Unboxed Metadata: Name, Date, Venue */}
      <div className="flex flex-col flex-1 justify-between p-3.5 gap-1.5">
        <h3 className="font-display text-[15px] sm:text-[16px] font-bold text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-1">
          {displayTitle}
        </h3>

        <div className="flex items-center justify-between text-xs text-white/50 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 truncate">
            {dateStr && <span className="font-mono text-[11px] text-white/60">{dateStr}</span>}
            {dateStr && <span className="text-white/20">•</span>}
            <span className="truncate text-white/45">{cleanVenue}</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#C084FC]/80 group-hover:text-[#C084FC] shrink-0 ml-2">
            Manage →
          </span>
        </div>
      </div>
    </Link>
  );
}
