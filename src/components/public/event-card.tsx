"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, Camera, ImageIcon, Folder, ExternalLink, HardDrive } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc, formatEventDate } from "@/lib/utils";

export function EventCard({ event, priority }: { event: Event; priority?: boolean }) {
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = formatEventDate(event.event_date || event.created_at);

  return (
    <motion.div
      className="h-full block group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <Link
        href={`/gallery/${event.id}`}
        className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-[#090510] border border-white/[0.08] hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_rgba(79,22,142,0.25)] focus-visible:outline-none"
        data-cursor="image"
      >
        {/* Cover image preview */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0514]">
          {event.cover_photo_url ? (
            <Image
              src={imgSrc}
              alt={event.title}
              fill
              unoptimized
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#07030D]">
              <Camera size={32} className="text-white/15" />
            </div>
          )}

          {/* Silky dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090510] via-black/25 to-transparent z-10" />

          {/* Top badges bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2">
            {/* Date Pill */}
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90 shadow-md">
                <Calendar size={10} className="text-[#C084FC]" />
                <span>{dateStr}</span>
              </span>
            )}

            {/* Photo count */}
            {event.photo_count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-[10px] font-mono font-medium text-white/90 shadow-md ml-auto">
                <ImageIcon size={10} className="text-[#C084FC]" />
                <span>{event.photo_count} photos</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Content & Details */}
        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 space-y-3">
          <div className="space-y-2">
            {event.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#C084FC] bg-purple-500/10 border border-purple-500/25">
                {event.category}
              </span>
            )}

            <h3 className="font-display text-[15px] sm:text-[17px] font-bold leading-snug text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-2">
              {event.title}
            </h3>

            {/* Subfolders list pills */}
            {event.subfolders && event.subfolders.length > 0 && (
              <div className="flex pt-1 flex-wrap gap-1.5">
                {event.subfolders.slice(0, 3).map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[9px] sm:text-[10px] text-white/70 font-mono truncate max-w-[130px]"
                  >
                    <Folder size={9} className="text-[#9D5EE5] shrink-0" />
                    <span className="truncate">{sub}</span>
                  </span>
                ))}
                {event.subfolders.length > 3 && (
                  <span className="text-[9px] text-white/40 font-mono self-center">
                    +{event.subfolders.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Venue + View Action */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
            <span className="flex items-center gap-1 text-[11px] text-white/50 truncate max-w-[150px] sm:max-w-[180px]">
              <MapPin size={11} className="text-[#9D5EE5] shrink-0" />
              <span className="truncate">{event.venue?.split(",")[0] || "CBIT Campus"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] group-hover:bg-[#9D5EE5] border border-white/10 group-hover:border-purple-400/50 text-[11px] font-semibold text-white transition-all duration-300">
              <span>View Photos</span>
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
