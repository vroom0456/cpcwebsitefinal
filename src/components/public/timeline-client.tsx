"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Camera } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc } from "@/lib/utils";

interface MonthGroup {
  key: string;
  label: string;
  events: Event[];
}

interface YearGroup {
  year: string;
  months: MonthGroup[];
}

function groupEvents(events: Event[]): YearGroup[] {
  const yearMap = new Map<string, Map<string, MonthGroup>>();

  for (const event of events) {
    const year = event.academic_year ?? "Undated";
    const date = event.event_date ? new Date(event.event_date) : null;
    const monthKey = date
      ? `${year}__${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`
      : `${year}__undated`;
    const monthLabel = date
      ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Undated";

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const months = yearMap.get(year)!;
    if (!months.has(monthKey)) months.set(monthKey, { key: monthKey, label: monthLabel, events: [] });
    months.get(monthKey)!.events.push(event);
  }

  // Sort months in descending order (newest first)
  return Array.from(yearMap.entries()).map(([year, months]) => {
    const sortedMonths = Array.from(months.values()).sort((a, b) => b.key.localeCompare(a.key));
    return {
      year,
      months: sortedMonths,
    };
  });
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function TimelineClient({ events }: { events: Event[] }) {
  const yearGroups = useMemo(() => groupEvents(events), [events]);

  // Restore scroll position back to the exact event that was clicked when coming back
  useEffect(() => {
    const targetId = sessionStorage.getItem("timeline-back-target");
    if (targetId) {
      sessionStorage.removeItem("timeline-back-target");
      setTimeout(() => {
        const el = document.getElementById(`event-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "center" });
          el.classList.add("ring-2", "ring-cpcLight", "ring-offset-2", "ring-offset-black", "rounded-[2rem]");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-cpcLight", "ring-offset-2", "ring-offset-black", "rounded-[2rem]");
          }, 1500);
        }
      }, 100);
    }
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="mt-16 space-y-24 max-w-5xl mx-auto px-4 sm:px-6"
    >
      {yearGroups.map((group, idx) => (
        <YearSection key={group.year} group={group} index={idx} />
      ))}
    </motion.div>
  );
}

function YearSection({ group, index }: { group: YearGroup; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative flex flex-col md:flex-row gap-10 md:gap-16 pb-16 border-b border-white/[0.05] last:border-0"
    >
      {/* Year Sidebar Node (Sticky) */}
      <div className="md:w-44 shrink-0 md:sticky md:top-32 h-fit">
        <h2 className="font-display font-black text-4xl sm:text-5xl text-gradient-purple uppercase tracking-tight leading-none drop-shadow">
          {group.year}
        </h2>
        <div className="h-1 w-12 bg-cpcLight/55 rounded-full mt-4 hidden md:block" />
      </div>

      {/* Months list & Events on the right */}
      <div className="flex-grow space-y-12">
        {group.months.map((month) => (
          <div key={month.key} className="space-y-6">
            {/* Month indicator banner */}
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/55 border-l-2 border-cpcLight pl-4">
              {month.label}
            </h3>

            {/* List of cards */}
            <div className="grid grid-cols-1 gap-6">
              {month.events.map((event) => (
                <div
                  key={event.id}
                  id={`event-card-${event.id}`}
                  onClick={() => sessionStorage.setItem("timeline-back-target", event.id)}
                  className="transition-all duration-300"
                >
                  <TimelineCard event={event} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function getOrdinalDay(day: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];
  return `${day}${suffix ?? "th"}`;
}

function TimelineCard({ event }: { event: Event }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.6, ease: EASE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/gallery/${event.id}`}
        className="group flex flex-col sm:flex-row gap-6 rounded-[2rem] border border-white/[0.04] bg-white/[0.01] p-5 transition-all duration-500 hover:border-cpcLight/35 hover:bg-cpcPurple/[0.03] hover:shadow-[0_20px_50px_-20px_rgba(157,94,229,0.25)] backdrop-blur-sm"
      >
        {/* Cover Photo */}
        <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-cpcDark border border-white/5 shadow-inner">
          {event.cover_photo_url ? (
            <Image
              src={coverPhotoSrc(event.cover_photo_url, 400)}
              alt={event.title}
              fill
              loading="lazy"
              unoptimized={true}
              sizes="(max-width: 640px) 100vw, 112px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <Camera size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
        </div>

        {/* Text contents */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h4 className="font-display font-bold text-lg sm:text-xl text-[#F8F5FB] uppercase tracking-wide group-hover:text-cpcLight transition-colors duration-300 line-clamp-1">
            {event.title}
          </h4>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs text-[#F8F5FB]/40">
            {event.event_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-cpcLight/80" />
                {getOrdinalDay(new Date(event.event_date).getDate())}
              </span>
            )}
          </div>
        </div>

        {/* Action Chevron */}
        <div className="self-center flex items-center justify-center w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] text-[#F8F5FB]/40 transition-all duration-400 group-hover:border-cpcLight/30 group-hover:bg-cpcLight/10 group-hover:text-[#F8F5FB] group-hover:translate-x-1 shrink-0">
          <ChevronRight className="h-5 w-5" />
        </div>
      </Link>
    </motion.div>
  );
}
