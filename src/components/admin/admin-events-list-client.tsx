"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus, ImageIcon, Camera,
  Sparkles, Calendar, MapPin, FileSpreadsheet,
} from "lucide-react";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle } from "@/lib/utils";
import type { Event } from "@/types/database";
import { EventFilters } from "@/components/public/event-filters";
import { CBIT_CAMPUS_VENUES, getAllCBITClubsList } from "@/lib/data/cbit-clubs";
import { GoogleSheetSync } from "@/components/admin/google-sheet-sync";

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

export function AdminEventsListClient({ events, isAdmin }: AdminEventsListClientProps) {
  const [q, setQ] = useState("");
  const [venue, setVenue] = useState("");
  const [organizingClub, setOrganizingClub] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showSheetSync, setShowSheetSync] = useState(false);

  // Extract filter sets for the 4 filters: Venue, Club, Month, Year
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

    // Dynamic values from events
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
    let list = [...events];

    if (q.trim()) {
      const query = q.toLowerCase().trim();
      list = list.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(query);
        const venueMatch = matchesEventVenue(e, query) || e.venue?.toLowerCase().includes(query);
        const clubMatch =
          matchesEventClubOrDept(e, query) ||
          e.organizing_club?.toLowerCase().includes(query) ||
          e.department?.toLowerCase().includes(query);
        const slugMatch = e.slug?.toLowerCase().includes(query);
        const dateMatch = (e.event_date || "").includes(query);
        const categoryMatch = e.category?.toLowerCase().includes(query);
        const descMatch = e.description?.toLowerCase().includes(query);
        return Boolean(titleMatch || venueMatch || clubMatch || slugMatch || dateMatch || categoryMatch || descMatch);
      });
    }

    if (venue) {
      list = list.filter((e) => matchesEventVenue(e, venue));
    }

    if (organizingClub) {
      list = list.filter((e) => matchesEventClubOrDept(e, organizingClub));
    }

    if (year) {
      list = list.filter((e) => {
        const d = e.event_date || "";
        return d.includes(year) || e.title.includes(year) || (e.academic_year || "").includes(year);
      });
    }

    if (month) {
      const mPadded = month.padStart(2, "0");
      list = list.filter((e) => {
        const d = e.event_date || "";
        const t = e.title;
        const matchIso = d.includes(`-${mPadded}-`) || d.endsWith(`-${mPadded}`);
        const matchTitle =
          t.includes(`-${mPadded}-`) ||
          t.includes(`/${mPadded}/`) ||
          t.includes(`-${month}-`) ||
          t.includes(`/${month}/`);
        return Boolean(matchIso || matchTitle);
      });
    }

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
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setShowSheetSync((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#C084FC]" />
              <span>{showSheetSync ? "Hide Sheet Sync" : "Sync Google Sheet"}</span>
            </button>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-primary-glow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Link>
          </div>
        )}
      </div>

      {/* ── Collapsible Google Sheet Sync Section ── */}
      {isAdmin && showSheetSync && (
        <div className="transition-all animate-fadeIn">
          <GoogleSheetSync />
        </div>
      )}

      {/* ── 4 Required Filters: Venue, Organising Club, Month, Year ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090512] border border-white/[0.08] shadow-xl">
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
            className="text-xs text-white/80 hover:text-white underline cursor-pointer transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* ── Event Card Grid (Grouped by Year, Latest First) ── */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 glass-card rounded-2xl p-8 border border-white/[0.06]">
          <Camera size={36} className="text-white/30" />
          <p className="text-white/60 text-sm font-medium">
            {hasActiveFilters ? "No events match the selected filters" : "No events registered yet"}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-bold hover:bg-white/20 transition-colors cursor-pointer"
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

      {/* Clean Unboxed Metadata: Name, Badges, Date, Venue */}
      <div className="flex flex-col flex-1 justify-between p-3.5 gap-2">
        <div className="space-y-1.5">
          <h3 className="font-display text-[15px] sm:text-[16px] font-bold text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-1">
            {displayTitle}
          </h3>

          {/* Organizer & Category Pills */}
          {(event.organizing_club || event.department || event.category) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {(event.organizing_club || event.department) && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9.5px] font-medium text-[#D8B4FE] max-w-[140px] truncate">
                  <span className="truncate">{event.organizing_club || event.department}</span>
                </span>
              )}
              {event.category && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9.5px] font-medium text-emerald-300">
                  #{event.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-white/50 pt-1.5 border-t border-white/[0.04] mt-auto">
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
