"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ImageIcon } from "lucide-react";
import { coverPhotoSrc, cleanEventTitle, formatEditorialDate } from "@/lib/utils";

interface LatestEvent {
  id: string;
  title: string;
  cover_photo_url: string | null;
  photo_count: number;
  event_date?: string | null;
  created_at?: string;
  venue?: string | null;
  subfolders?: string[];
}

interface HomeLatestCoverageProps {
  /** Featured event (admin-selected or fallback) */
  featuredEvent?: LatestEvent | null;
  /** Most recent non-featured event */
  recentEvent?: LatestEvent | null;
  /** Additional recent events for the row */
  recentEvents?: LatestEvent[];
}

function EventPreviewCard({ event, priority = false }: { event: LatestEvent; priority?: boolean }) {
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const title = cleanEventTitle(event.title);
  const date = formatEditorialDate(event.event_date || event.created_at);

  return (
    <Link
      href={`/gallery/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#9D5EE5]/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(157,94,229,0.15)]"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[#0A0514]">
        {event.cover_photo_url ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={28} className="text-white/10" />
          </div>
        )}
        {/* Photo count badge */}
        {event.photo_count > 0 && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white/80">
            <ImageIcon size={10} className="text-[#C084FC]" />
            {event.photo_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 gap-1.5">
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-white group-hover:text-[#C084FC] transition-colors line-clamp-1 leading-snug">
          {title}
        </h3>
        {date && (
          <span className="flex items-center gap-1.5 text-[11px] text-white/45 font-mono">
            <Calendar size={10} className="text-[#C084FC]/60" />
            {date}
          </span>
        )}
      </div>
    </Link>
  );
}

export function HomeLatestCoverage({ featuredEvent, recentEvent, recentEvents = [] }: HomeLatestCoverageProps) {
  // Build the display list: featured first, then recent, then extras — deduplicated, max 4
  const seen = new Set<string>();
  const events: LatestEvent[] = [];

  for (const ev of [featuredEvent, recentEvent, ...recentEvents]) {
    if (ev && !seen.has(ev.id) && events.length < 4) {
      seen.add(ev.id);
      events.push(ev);
    }
  }

  if (events.length === 0) return null;

  return (
    <section className="relative z-20 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C084FC] mb-1">
            Latest Coverage
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
            Recent Events
          </h2>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/50 hover:text-white transition-colors group shrink-0"
        >
          View All
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Event cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {events.map((event, i) => (
          <EventPreviewCard key={event.id} event={event} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}
