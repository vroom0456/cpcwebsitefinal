"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/shared/empty-state";
import type { Event } from "@/types/database";
import { EventCard } from "@/components/public/event-card";
import { cn, resolveEventDate, cleanEventTitle } from "@/lib/utils";

interface EventsPageClientProps {
  events: Event[];
  filterOptions?: any;
  initialParams?: any;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGE_SIZE = 12;

// ── Venue matching helpers ──
const VENUE_KEYWORD_MAP: Record<string, string[]> = {
  "d-block seminar hall": ["d-block", "d block", "dblock"],
  "assembly hall": ["assembly hall", "assembly"],
  "n-block seminar hall": ["n-block", "n block", "nblock"],
  "open air auditorium (oat)": ["oat", "open air", "open-air", "auditorium"],
  "cricket ground main stage": ["cricket ground", "cricket", "main stage"],
};

function matchesVenue(event: Event, selectedVenue: string): boolean {
  if (!selectedVenue) return true;
  const sv = selectedVenue.toLowerCase().trim();
  const ev = (event.venue || "").toLowerCase().trim();
  const et = event.title.toLowerCase();
  if (ev && (ev === sv || ev.includes(sv) || sv.includes(ev))) return true;
  const matchedKey = Object.keys(VENUE_KEYWORD_MAP).find((k) => sv.includes(k) || k.includes(sv));
  if (matchedKey) {
    const aliases = VENUE_KEYWORD_MAP[matchedKey];
    if (aliases) {
      for (const alias of aliases) {
        if (ev.includes(alias) || et.includes(alias)) return true;
      }
    }
  }
  return false;
}

// ── Sort options ──
type SortMode = "newest" | "oldest" | "az";

function sortEvents(list: Event[], mode: SortMode): Event[] {
  const sorted = [...list];
  switch (mode) {
    case "newest":
      sorted.sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));
      break;
    case "oldest":
      sorted.sort((a, b) => (a.event_date || "").localeCompare(b.event_date || ""));
      break;
    case "az":
      sorted.sort((a, b) => cleanEventTitle(a.title).localeCompare(cleanEventTitle(b.title)));
      break;
  }
  return sorted;
}

export function EventsPageClient({ events, initialParams }: EventsPageClientProps) {
  const [q, setQ] = useState(initialParams?.q || "");
  const [year, setYear] = useState(initialParams?.year || "");
  const [sort, setSort] = useState<SortMode>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Derive available years from events
  const years = useMemo(() => {
    const ySet = new Set<string>();
    events.forEach((e) => {
      const d = e.event_date || "";
      const match = d.match(/\b(20\d{2})\b/);
      if (match?.[1]) ySet.add(match[1]);
    });
    ["2026", "2025", "2024", "2023"].forEach((y) => ySet.add(y));
    return Array.from(ySet).sort().reverse();
  }, [events]);

  // Filter events
  const filtered = useMemo(() => {
    let list = [...events];

    // Search
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((e) => {
        const title = e.title.toLowerCase();
        const venue = (e.venue || "").toLowerCase();
        const club = (e.organizing_club || "").toLowerCase();
        const dept = (e.department || "").toLowerCase();
        const cat = (e.category || "").toLowerCase();
        const desc = (e.description || "").toLowerCase();
        const date = (e.event_date || "");
        const subfolder = e.subfolders?.some((s) => s.toLowerCase().includes(query));
        return (
          title.includes(query) ||
          venue.includes(query) ||
          club.includes(query) ||
          dept.includes(query) ||
          cat.includes(query) ||
          desc.includes(query) ||
          date.includes(query) ||
          subfolder ||
          matchesVenue(e, query)
        );
      });
    }

    // Year filter
    if (year) {
      list = list.filter((e) => {
        const d = e.event_date || "";
        return d.startsWith(year) || e.title.includes(year) || (e.academic_year || "").includes(year);
      });
    }

    // Sort
    return sortEvents(list, sort);
  }, [events, q, year, sort]);

  // Paginated subset
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const clearAll = () => {
    setQ("");
    setYear("");
    setSort("newest");
    setVisibleCount(PAGE_SIZE);
  };

  const hasFilters = q || year;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Search + Filters Row (Refined Compact Glassmorphism) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Search events by title, department, or venue..."
            className="w-full h-9 sm:h-9.5 pl-9 pr-9 rounded-xl bg-[#0D0718]/80 border border-white/[0.08] text-xs sm:text-[13px] text-white placeholder:text-white/35 focus:border-[#C084FC]/50 focus:bg-[#0D0718] focus:outline-none transition-all shadow-inner backdrop-blur-md"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Year selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setVisibleCount(PAGE_SIZE); }}
              className="w-full appearance-none h-9 sm:h-9.5 pl-3.5 pr-8 rounded-xl bg-[#0D0718]/80 border border-white/[0.08] text-xs sm:text-[13px] text-white/80 focus:border-[#C084FC]/50 focus:outline-none transition-all cursor-pointer sm:min-w-[110px] backdrop-blur-md"
            >
              <option value="" className="bg-[#0D0718] text-white">All Years</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#0D0718] text-white">{y}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
          </div>

          {/* Sort selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="w-full appearance-none h-9 sm:h-9.5 pl-3.5 pr-8 rounded-xl bg-[#0D0718]/80 border border-white/[0.08] text-xs sm:text-[13px] text-white/80 focus:border-[#C084FC]/50 focus:outline-none transition-all cursor-pointer sm:min-w-[125px] backdrop-blur-md"
            >
              <option value="newest" className="bg-[#0D0718] text-white">Newest First</option>
              <option value="oldest" className="bg-[#0D0718] text-white">Oldest First</option>
              <option value="az" className="bg-[#0D0718] text-white">A — Z</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Results info ── */}
      <div className="flex items-center justify-between text-[12px] text-white/35">
        <span>
          Showing <span className="text-white/70 font-medium">{visible.length}</span> of{" "}
          <span className="text-white/70 font-medium">{filtered.length}</span> events
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-[#C084FC]/70 hover:text-[#C084FC] transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Event Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your search or filters."
        >
          <button
            onClick={clearAll}
            className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-medium text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {visible.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.02, 0.15) }}
                className="h-full"
              >
                <EventCard event={event} priority={i < 6} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08] text-[13px] font-medium text-white/70 hover:text-white transition-all cursor-pointer"
              >
                Load More
                <span className="text-[11px] text-white/40">
                  ({filtered.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
