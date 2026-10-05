"use client";

import { useState, useMemo } from "react";
import {
  LayoutGrid,
  List,
  Calendar,
  Folder,
  ArrowUpRight,
  HardDrive,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import type { Event } from "@/types/database";
import { EventCard } from "@/components/public/event-card";
import { EventFilters } from "@/components/public/event-filters";
import { cn, resolveEventDate, cleanEventTitle } from "@/lib/utils";

interface EventsPageClientProps {
  events: Event[];
  filterOptions?: any;
  initialParams?: any;
}

interface YearGroup {
  year: string;
  events: Event[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [q, setQ] = useState("");
  const [venue, setVenue] = useState("");
  const [organizingClub, setOrganizingClub] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Derive filter option values
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

    // Extract dynamic values from events
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

  // Filter events and strictly arrange by latest date first
  const filtered = useMemo(() => {
    let list = [...events];

    // 1. Search filter
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(query);
        const venueMatch = e.venue?.toLowerCase().includes(query);
        const clubMatch =
          e.organizing_club?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query);
        const dateMatch = (e.event_date || "").includes(query);
        const subfolderMatch = e.subfolders?.some((s) => s.toLowerCase().includes(query));
        return Boolean(titleMatch || venueMatch || clubMatch || dateMatch || subfolderMatch);
      });
    }

    // 2. Venue filter
    if (venue) {
      const vQuery = venue.toLowerCase();
      list = list.filter((e) => {
        const v = (e.venue || "").toLowerCase();
        const t = e.title.toLowerCase();
        return v.includes(vQuery) || t.includes(vQuery);
      });
    }

    // 3. Organising Club filter
    if (organizingClub) {
      const cQuery = organizingClub.toLowerCase();
      list = list.filter((e) => {
        const c = (e.organizing_club || "").toLowerCase();
        const d = (e.department || "").toLowerCase();
        const t = e.title.toLowerCase();
        return c.includes(cQuery) || d.includes(cQuery) || t.includes(cQuery);
      });
    }

    // 4. Year filter
    if (year) {
      list = list.filter((e) => {
        const d = e.event_date || "";
        const t = e.title;
        return d.startsWith(year) || t.includes(year) || (e.academic_year || "").includes(year);
      });
    }

    // 5. Month filter
    if (month) {
      const mPadded = month.padStart(2, "0");
      list = list.filter((e) => {
        const d = e.event_date || "";
        // Match standard YYYY-MM-DD
        if (d.includes(`-${mPadded}-`)) return true;
        // Match title forms e.g. 05-2026 or 5/2026
        const t = e.title;
        return (
          t.includes(`-${mPadded}-`) ||
          t.includes(`/${mPadded}/`) ||
          t.includes(`-${month}-`) ||
          t.includes(`/${month}/`)
        );
      });
    }

    // ALWAYS strictly sort by event date descending (Latest First)
    list.sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));

    return list;
  }, [events, q, venue, organizingClub, month, year]);

  // Group by year for the grid view (latest year first)
  const yearGroups = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of filtered) {
      const resolvedDate = resolveEventDate(e);
      const yearMatch = resolvedDate.match(/\b(20\d{2})\b/);
      const yr = yearMatch ? yearMatch[1]! : e.event_date ? e.event_date.slice(0, 4) : "2026";
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr)!.push(e);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === "Undated") return 1;
        if (b === "Undated") return -1;
        return Number(b) - Number(a);
      })
      .map(([yr, groupEvents]) => ({ year: yr, events: groupEvents }));
  }, [filtered]);

  const totalPhotos = useMemo(
    () => events.reduce((acc, e) => acc + (e.photo_count || 0), 0),
    [events]
  );

  const clearAll = () => {
    setQ("");
    setVenue("");
    setOrganizingClub("");
    setMonth("");
    setYear("");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── The 4 Clean Filters: Venue, Organising Club, Month, Year ── */}
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
        clearFilters={clearAll}
      />

      {/* ── View Controls & Count Indicator ── */}
      <div className="flex items-center justify-between text-xs text-white/40 font-mono pt-1 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="text-white/80 font-semibold">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
          <span>•</span>
          <span className="text-[#C084FC] font-medium">Sorted: Latest First</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-white/40 uppercase tracking-widest text-[10px]">
            {totalPhotos.toLocaleString()} Photographs
          </span>
        </div>

        {/* Grid vs List View Switcher (Desktop only) */}
        <div className="hidden sm:inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === "grid"
                ? "bg-[#9D5EE5]/30 text-white shadow-sm"
                : "text-white/40 hover:text-white"
            )}
            title="Folder Grid View"
          >
            <LayoutGrid size={13} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === "list"
                ? "bg-[#9D5EE5]/30 text-white shadow-sm"
                : "text-white/40 hover:text-white"
            )}
            title="Drive List View"
          >
            <List size={13} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* ── Main Content View: Grid or List ── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="NO FRAMES FOUND"
          description="No archived events match the selected filters."
        >
          <button
            onClick={clearAll}
            className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            CLEAR FILTERS
          </button>
        </EmptyState>
      ) : viewMode === "grid" ? (
        /* ── Folder Grid View ── */
        <div className="space-y-8 sm:space-y-12">
          {yearGroups.map((group) => (
            <section key={group.year}>
              {/* Year Header & Chronological indicator */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-white/80">
                  <Folder size={14} className="text-[#9D5EE5]" />
                  <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] font-mono">
                    {group.year} Archive
                  </h2>
                </div>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] sm:text-[11px] font-mono text-white/40">
                  {group.events.length} {group.events.length === 1 ? "story" : "stories"}
                </span>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.03, 0.2) }}
                    className="h-full"
                  >
                    <EventCard event={event} priority={i < 6} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* ── Google Drive List View (Table Format) ── */
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#07030D] shadow-2xl">
          <table className="w-full text-left text-xs text-white/80 border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-white/40">
                <th className="py-4 px-5">Event Title</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Photos</th>
                <th className="py-4 px-4 hidden sm:table-cell">Size</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((event) => {
                const dateStr = resolveEventDate(event);
                const displayTitle = cleanEventTitle(event.title);
                const storageMb = event.storage_bytes
                  ? `${(event.storage_bytes / (1024 * 1024)).toFixed(1)} MB`
                  : "--";

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => {
                      window.location.href = `/gallery/${event.id}`;
                    }}
                  >
                    {/* Folder Name */}
                    <td className="py-4 px-5 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#9D5EE5]/20 border border-[#9D5EE5]/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#9D5EE5]/30 transition-all">
                          <Folder size={15} className="text-[#C084FC]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[13px] group-hover:text-[#C084FC] transition-colors truncate">
                            {displayTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-mono text-white/70 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-[#C084FC]" />
                        {dateStr}
                      </span>
                    </td>

                    {/* Photos Count */}
                    <td className="py-4 px-4 font-mono text-white/90">
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-semibold text-[#C084FC]">
                        {event.photo_count || 0}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4 font-mono text-white/40 hidden sm:table-cell">
                      {storageMb}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/gallery/${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C084FC] hover:text-white transition-colors"
                      >
                        <span>Open</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
