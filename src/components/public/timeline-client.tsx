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
          el.classList.add("ring-2", "ring-[#C084FC]", "ring-offset-2", "ring-offset-black", "rounded-[2rem]");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-[#C084FC]", "ring-offset-2", "ring-offset-black", "rounded-[2rem]");
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
      className="mt-6 sm:mt-14 space-y-10 sm:space-y-20 max-w-5xl mx-auto px-3.5 sm:px-6"
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative flex flex-col md:flex-row gap-4 md:gap-16 pb-8 md:pb-16 border-b border-white/[0.05] last:border-0"
    >
      {/* Year Sidebar Node (Sticky) */}
      <div className="md:w-44 shrink-0 md:sticky md:top-32 h-fit">
        <h2 className="font-display font-black text-2xl sm:text-5xl text-gradient-purple uppercase tracking-tight leading-none drop-shadow">
          {group.year}
        </h2>
        <div className="h-1 w-12 bg-[#C084FC]/55 rounded-full mt-3 hidden md:block" />
      </div>

      {/* Months list & Events on the right */}
      <div className="flex-grow space-y-6 sm:space-y-10">
        {group.months.map((month) => (
          <div key={month.key} className="space-y-3 sm:space-y-4">
            {/* Month indicator banner */}
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/50 border-l-2 border-[#C084FC] pl-3 sm:pl-4">
              {month.label}
            </h3>

            {/* List of cards */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Link
        href={`/gallery/${event.id}`}
        className="group flex flex-row items-center gap-3.5 sm:gap-6 rounded-2xl sm:rounded-[2rem] border border-white/[0.04] bg-white/[0.015] p-2.5 sm:p-5 transition-all duration-300 hover:border-[#C084FC]/35 hover:bg-purple-500/[0.03] hover:shadow-[0_15px_40px_-20px_rgba(157,94,229,0.25)] backdrop-blur-sm"
      >
        {/* Cover Photo - Compact square on mobile, spacious square on desktop */}
        <div className="relative w-16 h-16 sm:w-28 sm:h-28 aspect-square shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-[#170B24] border border-white/5 shadow-inner">
          {event.cover_photo_url ? (
            <Image
              src={coverPhotoSrc(event.cover_photo_url, 400)}
              alt={event.title}
              fill
              loading="lazy"
              unoptimized={true}
              sizes="(max-width: 640px) 64px, 112px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <Camera size={20} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
        </div>

        {/* Text contents */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h4 className="font-display font-bold text-sm sm:text-xl text-[#F8F5FB] uppercase tracking-wide group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-1">
            {event.title}
          </h4>
          
          <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[11px] sm:text-xs text-[#F8F5FB]/45 font-mono">
            {event.event_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C084FC]/80" />
                {getOrdinalDay(new Date(event.event_date).getDate())}
              </span>
            )}
            {event.venue && (
              <span className="hidden sm:inline-flex items-center gap-1.5 truncate text-white/35">
                • {event.venue}
              </span>
            )}
          </div>
        </div>

        {/* Action Chevron */}
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/5 bg-white/[0.02] text-[#F8F5FB]/40 transition-all duration-300 group-hover:border-[#C084FC]/30 group-hover:bg-[#C084FC]/10 group-hover:text-[#F8F5FB] group-hover:translate-x-0.5 shrink-0">
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </Link>
    </motion.div>
  );
}
