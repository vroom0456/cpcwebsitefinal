"use client";

import { useState, useMemo } from "react";
import {
  LayoutGrid,
  List,
  Calendar,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
  Folder,
  ArrowUpDown,
  ArrowUpRight,
  HardDrive,
  ImageIcon,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import type { Event } from "@/types/database";
import { EventCard } from "@/components/public/event-card";
import { cn, formatEventDate } from "@/lib/utils";

interface EventsPageClientProps {
  events: Event[];
  filterOptions: {
    departments: string[];
    academicYears: string[];
    categories: string[];
  };
  initialParams: any;
}

interface YearGroup {
  year: string;
  events: Event[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function EventsPageClient({ events, filterOptions, initialParams }: EventsPageClientProps) {
  const [q, setQ] = useState(initialParams?.q ?? "");
  const [academicYear, setAcademicYear] = useState(initialParams?.year ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"date-desc" | "date-asc" | "name-asc">("date-desc");

  // Filter events client-side with typo-tolerant fuzzy matching
  const filtered = useMemo(() => {
    let list = [...events];

    if (q.trim()) {
      const query = q.trim().toLowerCase();

      function isFuzzy(text?: string | null): boolean {
        if (!text) return false;
        const tNorm = text.toLowerCase();
        if (tNorm.includes(query)) return true;

        const tClean = tNorm.replace(/[\s\-_.:,/'"()]+/g, "");
        const qClean = query.replace(/[\s\-_.:,/'"()]+/g, "");
        return Boolean(tClean && qClean && (tClean.includes(qClean) || qClean.includes(tClean)));
      }

      list = list.filter(
        (e) =>
          isFuzzy(e.title) ||
          isFuzzy(e.venue) ||
          isFuzzy(e.department) ||
          isFuzzy(e.category) ||
          (e.subfolders && e.subfolders.some((s) => isFuzzy(s)))
      );
    }

    if (academicYear) {
      list = list.filter((e) => e.academic_year === academicYear);
    }

    if (selectedCategory) {
      list = list.filter((e) => e.category === selectedCategory);
    }

    // Sort order
    list.sort((a, b) => {
      if (sortOrder === "date-desc") {
        return (b.event_date || "").localeCompare(a.event_date || "");
      }
      if (sortOrder === "date-asc") {
        return (a.event_date || "").localeCompare(b.event_date || "");
      }
      if (sortOrder === "name-asc") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return list;
  }, [events, q, academicYear, selectedCategory, sortOrder]);

  // Group by year for the grid view
  const yearGroups = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of filtered) {
      const year = e.event_date ? e.event_date.slice(0, 4) : "Undated";
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(e);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (sortOrder === "date-asc") {
          if (a === "Undated") return 1;
          if (b === "Undated") return -1;
          return Number(a) - Number(b);
        }
        if (a === "Undated") return 1;
        if (b === "Undated") return -1;
        return Number(b) - Number(a);
      })
      .map(([year, groupEvents]) => ({ year, events: groupEvents }));
  }, [filtered, sortOrder]);

  // Drive metrics
  const totalPhotos = useMemo(
    () => events.reduce((acc, e) => acc + (e.photo_count || 0), 0),
    [events]
  );
  const totalStorageMb = useMemo(() => {
    const bytes = events.reduce((acc, e) => acc + (e.storage_bytes || 0), 0);
    return Math.round(bytes / (1024 * 1024));
  }, [events]);

  const hasActiveFilters = q || academicYear || selectedCategory;

  const clearAll = () => {
    setQ("");
    setAcademicYear("");
    setSelectedCategory("");
  };

  return (
    <div className="space-y-8">
      {/* ── Compact Sleek Google Drive Breadcrumb Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-2 px-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/50 font-mono">
          <Folder size={12} className="text-[#C084FC]" />
          <Link href="/events" className="hover:text-white transition-colors text-white/70">
            Google Drive
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70">CBIT Photo Club</span>
          <span className="text-white/20">/</span>
          <span className="text-[#C084FC] font-semibold">Events Archive</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-white/40">
          <span>{events.length} Folders</span>
          <span>·</span>
          <span>{totalPhotos.toLocaleString()} Photos</span>
        </div>
      </div>

      {/* ── Search, Sort, View Mode & Filters Bar ── */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search folders, events, dates, or subfolders…"
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#9D5EE5]/50 focus:ring-1 focus:ring-[#9D5EE5]/20 transition-all"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Controls: Sort Order, View Switcher & Filters */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full md:w-auto">
          {/* Chronological Sort Selector */}
          <div className="relative flex-1 md:flex-initial inline-flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full md:w-auto appearance-none px-3 sm:px-4 py-2.5 sm:py-3 pr-8 sm:pr-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-[12px] font-medium text-white/90 focus:outline-none focus:border-[#9D5EE5]/50 cursor-pointer transition-all"
            >
              <option value="date-desc" className="bg-[#0e071a] text-white">
                📅 Date: Newest
              </option>
              <option value="date-asc" className="bg-[#0e071a] text-white">
                📅 Date: Oldest
              </option>
              <option value="name-asc" className="bg-[#0e071a] text-white">
                🔤 Name: A to Z
              </option>
            </select>
            <ChevronDown className="absolute right-2.5 sm:right-3 h-3.5 w-3.5 text-white/40 pointer-events-none" />
          </div>

          {/* Grid vs List View Switcher */}
          <div className="shrink-0 inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "grid"
                  ? "bg-[#9D5EE5]/30 text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
              title="Folder Grid View"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "list"
                  ? "bg-[#9D5EE5]/30 text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
              title="Drive List View"
            >
              <List size={14} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-[12px] sm:text-[13px] font-medium transition-all",
              showFilters
                ? "bg-[#9D5EE5]/15 border-[#9D5EE5]/40 text-white"
                : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
            )}
            <ChevronDown className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-200", showFilters && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-6 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              {/* Academic Year */}
              {filterOptions.academicYears.length > 0 && (
                <div className="space-y-2 min-w-[160px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Academic Year</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.academicYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => setAcademicYear(academicYear === y ? "" : y)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all",
                          academicYear === y
                            ? "bg-[#9D5EE5]/20 border-[#9D5EE5]/50 text-[#C084FC]"
                            : "border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {filterOptions.categories.length > 0 && (
                <div className="space-y-2 min-w-[200px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all",
                          selectedCategory === cat
                            ? "bg-[#9D5EE5]/20 border-[#9D5EE5]/50 text-[#C084FC]"
                            : "border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="self-end text-[11px] text-white/40 hover:text-white underline transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Status Indicator ── */}
      <div className="flex items-center justify-between text-xs text-white/40 font-mono">
        <div className="flex items-center gap-2">
          <span>{filtered.length} {filtered.length === 1 ? "drive folder" : "drive folders"}</span>
          <span>•</span>
          <span className="text-[#C084FC] font-medium">
            {sortOrder === "date-desc" ? "In order of date (Newest first)" : sortOrder === "date-asc" ? "In order of date (Oldest first)" : "Alphabetical (A-Z)"}
          </span>
        </div>
      </div>

      {/* ── Main Content View: Grid or List ── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Google Drive folders match your search"
          description="Try clearing search filters to see all archived events and photo folders."
        />
      ) : viewMode === "grid" ? (
        /* ── Folder Grid View ── */
        <div className="space-y-8 sm:space-y-14">
          {yearGroups.map((group) => (
            <section key={group.year}>
              {/* Year Header & Chronological indicator */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3.5 sm:mb-6">
                <div className="flex items-center gap-2 text-white/80">
                  <Folder size={14} className="text-[#9D5EE5]" />
                  <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] font-mono">
                    {group.year} Archive
                  </h2>
                </div>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] sm:text-[11px] font-mono text-white/40">
                  {group.events.length} {group.events.length === 1 ? "folder" : "folders"}
                </span>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
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
                <th className="py-4 px-5">Folder Name</th>
                <th className="py-4 px-4">Event Date</th>
                <th className="py-4 px-4 hidden md:table-cell">Subfolders</th>
                <th className="py-4 px-4">Photos</th>
                <th className="py-4 px-4 hidden sm:table-cell">Size</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((event) => {
                const dateStr = formatEventDate(event.event_date || event.created_at);
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
                            {event.title}
                          </p>
                          {event.category && (
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                              {event.category}
                            </span>
                          )}
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

                    {/* Subfolders */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {event.subfolders && event.subfolders.length > 0 ? (
                          event.subfolders.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-white/60 truncate"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/20 font-mono">Root only</span>
                        )}
                        {event.subfolders && event.subfolders.length > 2 && (
                          <span className="text-[10px] text-white/40 font-mono">
                            +{event.subfolders.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Photo count */}
                    <td className="py-4 px-4 font-mono text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon size={11} className="text-[#9D5EE5]" />
                        {event.photo_count}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4 font-mono text-white/50 hidden sm:table-cell">
                      {storageMb}
                    </td>

                    {/* Open Button */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/gallery/${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#9D5EE5] text-white text-xs font-semibold transition-all group-hover:bg-[#9D5EE5]"
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
