"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, Camera, ImageIcon, Folder } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc, formatEditorialDate, cleanEventTitle } from "@/lib/utils";

export function EventCard({ event, priority }: { event: Event; priority?: boolean }) {
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = formatEditorialDate(event.event_date || event.created_at);
  const displayTitle = cleanEventTitle(event.title);

  return (
    <motion.div
      className="h-full flex flex-col group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <Link
        href={`/gallery/${event.id}`}
        className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-[#090510] border border-white/[0.08] hover:border-[#9D5EE5]/50 transition-all duration-300 shadow-xl hover:shadow-[0_16px_40px_rgba(157,94,229,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D5EE5]"
        data-cursor="image"
      >
        {/* Cover image preview */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0514]">
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

          {/* Silky dark vignette to guarantee text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090510] via-black/25 to-black/35 pointer-events-none z-10" />

          {/* Top badges bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
            {/* Date Pill */}
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-white/90 shadow-md">
                <Calendar size={10} className="text-[#C084FC]" />
                <span>{dateStr}</span>
              </span>
            )}

            {/* Photo count */}
            {event.photo_count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-[#C084FC] shadow-md ml-auto">
                <ImageIcon size={10} className="text-[#C084FC]" />
                <span>{event.photo_count} photos</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Content & Details (Uniform heights across all grid columns) */}
        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 gap-3.5">
          <div className="space-y-2">
            {/* Top row: Category tag & Album count */}
            <div className="flex items-center justify-between gap-2 min-h-[20px]">
              {event.category ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold uppercase tracking-wider text-[#C084FC] bg-[#9D5EE5]/15 border border-[#9D5EE5]/25">
                  {event.category}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold uppercase tracking-wider text-white/40 bg-white/[0.03] border border-white/[0.06]">
                  Archive
                </span>
              )}

              {event.subfolders && event.subfolders.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Folder size={10} className="text-[#9D5EE5]" />
                  <span>{event.subfolders.length} {event.subfolders.length === 1 ? "album" : "albums"}</span>
                </span>
              )}
            </div>

            {/* Title with locked 2-line clamp and baseline alignment */}
            <h3 className="font-display text-[15px] sm:text-[16px] font-bold leading-snug text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
              {displayTitle}
            </h3>

            {/* Clean editorial subfolder summary on a single line — NO messy boxes */}
            {event.subfolders && event.subfolders.length > 0 ? (
              <p className="text-[11px] text-white/45 font-mono truncate">
                Includes: {event.subfolders.slice(0, 3).join(" · ")}
                {event.subfolders.length > 3 && ` +${event.subfolders.length - 3}`}
              </p>
            ) : (
              <p className="text-[11px] text-white/30 font-mono truncate">
                Curated Institute Photography
              </p>
            )}
          </div>

          {/* Bottom Bar: Venue + View Action (Locked to bottom) */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs mt-auto">
            <span className="flex items-center gap-1.5 text-[11px] text-white/50 truncate max-w-[140px] sm:max-w-[170px]">
              <MapPin size={11} className="text-[#9D5EE5] shrink-0" />
              <span className="truncate">{event.venue?.split(",")[0] || "CBIT Campus"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] group-hover:bg-[#9D5EE5] border border-white/10 group-hover:border-purple-400/50 text-[11px] font-semibold text-white/90 group-hover:text-white transition-all duration-300 shadow-sm">
              <span>View Photos</span>
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
