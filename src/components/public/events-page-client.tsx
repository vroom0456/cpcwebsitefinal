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
import { CBIT_CAMPUS_VENUES, getAllCBITClubsList } from "@/lib/data/cbit-clubs";

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

// Map of campus venues to common keywords/abbreviations
const VENUE_KEYWORD_MAP: Record<string, string[]> = {
  "d-block seminar hall": ["d-block", "d block", "dblock"],
  "assembly hall": ["assembly hall", "assembly"],
  "n-block seminar hall": ["n-block", "n block", "nblock"],
  "sms seminar hall": ["sms seminar", "sms hall"],
  "e-classroom": ["e-classroom", "e classroom", "eclassroom"],
  "r&e hub": ["r&e", "r & e", "r and e", "research & entrepreneurship", "r&e hub"],
  "tpo labs": ["tpo labs", "tpo lab", "tpo", "placement"],
  "cdc conference hall": ["cdc conference", "cdc hall", "cdc"],
  "open air auditorium (oat)": ["oat", "open air", "open-air", "auditorium"],
  "cricket ground main stage": ["cricket ground", "cricket", "main stage"],
};

function matchesEventVenue(event: Event, selectedVenue: string): boolean {
  if (!selectedVenue) return true;
  const sv = selectedVenue.toLowerCase().trim();
  const ev = (event.venue || "").toLowerCase().trim();
  const et = event.title.toLowerCase();
  const ed = (event.description || "").toLowerCase();

  // 1. Direct equality or substring containment
  if (ev && (ev === sv || ev.includes(sv) || sv.includes(ev))) return true;

  // 2. Map-based alias matching
  const matchedKey = Object.keys(VENUE_KEYWORD_MAP).find(
    (k) => sv.includes(k) || k.includes(sv)
  );
  if (matchedKey) {
    const aliases = VENUE_KEYWORD_MAP[matchedKey];
    if (aliases) {
      for (const alias of aliases) {
        if (ev && ev.includes(alias)) return true;
        if (et.includes(alias) || ed.includes(alias)) return true;
      }
    }
  }

  // 3. Fallback: check non-trivial word tokens
  const tokens = sv
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["hall", "seminar", "main"].includes(w));
  if (tokens.length > 0 && tokens.every((tok) => ev.includes(tok) || et.includes(tok))) {
    return true;
  }

  return false;
}

// Club specific alias mapping to bridge formal titles with common acronyms/short names
const CLUB_KEYWORD_MAP: Record<string, string[]> = {
  "cbit photo club": ["cpc", "photo", "chhaaya", "chhaya"],
  "sudhee tech fest": ["sudhee"],
  "shruthi annual cultural": ["shruthi"],
  "principal office": ["principal", "student affairs"],
  "chaitanya chaya (photography)": ["cpc", "photo", "chhaaya", "chhaya"],
  "chaitanya chaya (film": ["film"],
  "chaitanya chaya (drama": ["drama"],
  "chaitanya lasya": ["lasya", "udc", "dance"],
  "chaitanya geethi": ["geethi", "singing"],
  "chaitanya vaadya": ["vaadya", "music", "instrumental"],
  "chaitanya srujana": ["srujana", "painting", "craft"],
  "communicando": ["communicando"],
  "toastmasters": ["toastmaster", "toastmasters"],
  "mun": ["mun", "model united nations"],
  "geervana bharathi": ["geervana", "sanskrit"],
  "transcendent": ["transcendent"],
  "chaitanya kruthi": ["kruthi", "writer", "poet"],
  "chaitanya seva": ["nss", "national service"],
  "chaitanya spandana": ["street cause", "spandana"],
  "engineers without borders": ["ewb"],
  "technical seva": ["medha"],
  "elc": ["elc", "electoral"],
  "parivritha": ["parivritha"],
  "chaitanya oorja": ["oorja", "energy saver"],
  "entrepreneurship development cell": ["edc", "chaitanya teja"],
  "wellness club": ["svaasthya", "wellness"],
  "women safety club": ["suraksha", "women safety"],
  "universal human values": ["uhv"],
  "chaitanya kreeda": ["kreeda", "aura", "sports"],
  "yoga club": ["yoga"],
  "chaitanya smrithi": ["smrithi", "alumni"],
  "cosc": ["cosc", "open source"],
  "gdsc": ["gdsc", "developer student"],
  "hackiton": ["hackiton"],
  "united coders": ["united coders"],
  "makers of india": ["moi", "makers of india"],
  "ieee student": ["ieee"],
  "iete student": ["iete"],
  "circuits & systems": ["cas"],
  "robotics": ["robotics", "ric"],
  "mechanical engineering association": ["mea"],
  "sae collegiate club": ["sae"],
  "asme student section": ["asme"],
  "astra": ["astra", "astronomy", "aerospace"],
  "civil engineering association": ["cea"],
  "indian concrete institute": ["ici"],
  "indian green building council": ["igbc"],
  "iiche": ["iiche"],
  "bioengineering": ["bioengineering"],
  "digital transactions": ["dtc"],
  "think club": ["think club"],
  "ramanujan": ["ramanujan"],
  "iste": ["iste"],
  "cse department": ["cse", "computer science"],
  "it department": ["it dept", "it department", "information technology"],
  "ece department": ["ece", "electronics"],
  "eee department": ["eee", "electrical"],
  "mechanical engineering department": ["mech", "mechanical"],
  "civil engineering department": ["civil"],
  "chemical engineering department": ["chemical", "chem dept", "chem"],
  "biotechnology department": ["biotech", "biotechnology"],
  "artificial intelligence & data science": ["ai&ds", "aids", "data science"],
  "artificial intelligence & machine learning": ["aiml", "ai&ml", "machine learning"],
  "school of management studies": ["sms", "mba"],
  "mca department": ["mca"],
  "physics / chemistry / mathematics": ["physics", "chemistry", "mathematics", "h&s"],
};

function matchesEventClubOrDept(event: Event, selectedClub: string): boolean {
  if (!selectedClub) return true;
  const sc = selectedClub.toLowerCase().trim();
  const oc = (event.organizing_club || "").toLowerCase().trim();
  const dept = (event.department || "").toLowerCase().trim();
  const et = event.title.toLowerCase();
  const ed = (event.description || "").toLowerCase();

  // 1. Direct match on organizing_club or department
  if (oc && (oc === sc || oc.includes(sc) || sc.includes(oc))) return true;
  if (dept && (dept === sc || dept.includes(sc) || sc.includes(dept))) return true;

  // 2. Check predefined keyword mappings
  const matchedKey = Object.keys(CLUB_KEYWORD_MAP).find((k) => sc.includes(k));
  if (matchedKey) {
    const keywords = CLUB_KEYWORD_MAP[matchedKey];
    if (keywords) {
      for (const kw of keywords) {
        if (oc && oc.includes(kw)) return true;
        if (dept && dept.includes(kw)) return true;
        // Word boundary match in title/description
        if (kw.length <= 4) {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          if (regex.test(et) || regex.test(ed)) return true;
        } else {
          if (et.includes(kw) || ed.includes(kw)) return true;
        }
      }
    }
  }

  // 3. Extract acronyms or text inside parentheses
  const parenMatches = selectedClub.match(/\(([^)]+)\)/g);
  if (parenMatches) {
    for (const p of parenMatches) {
      const inside = p.replace(/[()]/g, "").trim().toLowerCase();
      const parts = inside.split(/[-–,/]/).map((s) => s.trim());
      for (const part of parts) {
        if (part.length >= 2 && !["the", "club", "fest"].includes(part)) {
          if (oc && oc.includes(part)) return true;
          if (dept && dept.includes(part)) return true;
          if (part.length <= 4) {
            const regex = new RegExp(`\\b${part}\\b`, "i");
            if (regex.test(et) || regex.test(ed)) return true;
          } else {
            if (et.includes(part) || ed.includes(part)) return true;
          }
        }
      }
    }
  }

  return false;
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [q, setQ] = useState("");
  const [venue, setVenue] = useState("");
  const [organizingClub, setOrganizingClub] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Derive filter option values
  const { venues, organizingClubs, clubGroups, years } = useMemo(() => {
    const vSet = new Set<string>();
    const cSet = new Set<string>();
    const ySet = new Set<string>();

    // Standard CBIT Venues
    CBIT_CAMPUS_VENUES.forEach((v) => vSet.add(v));

    // Clubs from central registry
    const baseGroups = getAllCBITClubsList();
    baseGroups.forEach((g) => {
      g.options.forEach((opt) => cSet.add(opt));
    });

    // Extract dynamic values from events (custom venues, custom clubs, academic years)
    const extraClubs = new Set<string>();
    events.forEach((e) => {
      if (e.venue) vSet.add(e.venue.trim());
      if (e.organizing_club && e.organizing_club !== "featured_home") {
        const trimmed = e.organizing_club.trim();
        cSet.add(trimmed);
        if (!baseGroups.some((g) => g.options.includes(trimmed))) {
          extraClubs.add(trimmed);
        }
      }
      if (e.department) {
        const deptTrimmed = e.department.trim();
        cSet.add(deptTrimmed);
        if (!baseGroups.some((g) => g.options.includes(deptTrimmed))) {
          extraClubs.add(deptTrimmed);
        }
      }

      const d = e.event_date || "";
      const match = d.match(/\b(20\d{2})\b/);
      if (match && match[1]) ySet.add(match[1]);
    });

    ["2026", "2025", "2024", "2023"].forEach((y) => ySet.add(y));

    // Combine baseGroups with any extra active clubs found in events
    const allGroups = [...baseGroups];
    if (extraClubs.size > 0) {
      allGroups.push({
        group: "Additional Active Clubs & Depts",
        options: Array.from(extraClubs).sort(),
      });
    }

    return {
      venues: Array.from(vSet).sort(),
      organizingClubs: Array.from(cSet).sort(),
      clubGroups: allGroups,
      years: Array.from(ySet).sort().reverse(),
    };
  }, [events]);

  // Filter events and strictly arrange by latest date first
  const filtered = useMemo(() => {
    let list = [...events];

    // 1. Search filter: Matches title, venue, club, dept, date, subfolder, category, and tags in description
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(query);
        const venueMatch = matchesEventVenue(e, query) || e.venue?.toLowerCase().includes(query);
        const clubMatch =
          matchesEventClubOrDept(e, query) ||
          e.organizing_club?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query);
        const dateMatch = (e.event_date || "").includes(query);
        const subfolderMatch = e.subfolders?.some((s) => s.toLowerCase().includes(query));
        const categoryMatch = e.category?.toLowerCase().includes(query);
        const descMatch = e.description?.toLowerCase().includes(query);
        return Boolean(titleMatch || venueMatch || clubMatch || dateMatch || subfolderMatch || categoryMatch || descMatch);
      });
    }

    // 2. Venue filter
    if (venue) {
      list = list.filter((e) => matchesEventVenue(e, venue));
    }

    // 3. Organising Club filter
    if (organizingClub) {
      list = list.filter((e) => matchesEventClubOrDept(e, organizingClub));
    }

    // 4. Category filter
    if (category) {
      const cLower = category.toLowerCase();
      list = list.filter((e) => {
        const cat = (e.category || "").toLowerCase();
        const desc = (e.description || "").toLowerCase();
        return cat.includes(cLower) || desc.includes(cLower);
      });
    }

    // 5. Year filter
    if (year) {
      list = list.filter((e) => {
        const d = e.event_date || "";
        const t = e.title;
        return d.startsWith(year) || t.includes(year) || (e.academic_year || "").includes(year);
      });
    }

    // 6. Month filter
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
  }, [events, q, venue, organizingClub, category, month, year]);

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
    setCategory("");
    setMonth("");
    setYear("");
  };

  const quickCategories = [
    { label: "All Frames", value: "" },
    { label: "Technical", value: "Technical" },
    { label: "Cultural", value: "Cultural" },
    { label: "Hackathons", value: "Hackathon" },
    { label: "Workshops & Talks", value: "Workshop" },
    { label: "Guest Lectures", value: "Guest Lecture" },
    { label: "MoUs & Conclaves", value: "MoU" },
    { label: "Social Service & NSS", value: "Social Service" },
    { label: "Sports & Gaming", value: "Sports" },
    { label: "Felicitation", value: "Felicitation" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── The 4 Clean Filters: Venue, Organising Club, Month, Year ── */}
      <EventFilters
        venues={venues}
        organizingClubs={organizingClubs}
        clubGroups={clubGroups}
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

      {/* ── Quick Category & Event Tag Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 shrink-0 pr-1">
          Tags:
        </span>
        {quickCategories.map((c) => {
          const isActive = (c.value === "" && !category) || category === c.value;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer",
                isActive
                  ? "bg-[#9D5EE5] border-[#C084FC] text-white shadow-[0_0_15px_rgba(157,94,229,0.4)]"
                  : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07] hover:border-white/20"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

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
