"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Camera, ImageIcon } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle } from "@/lib/utils";

export function EventCard({ event, priority }: { event: Event; priority?: boolean }) {
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = resolveEventDate(event);
  const displayTitle = cleanEventTitle(event.title);

  return (
    <Link
      href={`/gallery/${event.id}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#9D5EE5]/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(157,94,229,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D5EE5]"
    >
      {/* Cover image — 3:2 aspect ratio */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[#0A0514]">
        {event.cover_photo_url ? (
          <Image
            src={imgSrc}
            alt={displayTitle}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#07030D]">
            <Camera size={28} className="text-white/10" />
          </div>
        )}

        {/* Photo count badge */}
        {event.photo_count > 0 && (
          <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white/80 pointer-events-none">
            <ImageIcon size={10} className="text-[#C084FC]" />
            {event.photo_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between p-3.5 sm:p-4 gap-2">
        <h3 className="font-display text-[14px] sm:text-[15px] font-semibold leading-snug text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-1">
          {displayTitle}
        </h3>

        {/* Date */}
        {dateStr ? (
          <span className="flex items-center gap-1.5 text-[11px] text-white/45 font-mono">
            <Calendar size={10} className="text-[#C084FC]/60 shrink-0" />
            {dateStr}
          </span>
        ) : (
          <span className="text-[11px] text-white/25 font-mono">No date</span>
        )}
      </div>
    </Link>
  );
}
