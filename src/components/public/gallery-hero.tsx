"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle } from "@/lib/utils";
import type { Event } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

interface GalleryHeroProps {
  event: Event;
  photoCount: number;
}

export function GalleryHero({ event, photoCount }: GalleryHeroProps) {
  const heroCover = event.cover_photo_url ? coverPhotoSrc(event.cover_photo_url, 1600) : null;
  const formattedDate = resolveEventDate(event);
  const displayTitle = cleanEventTitle(event.title);
  const actualPhotoCount = photoCount > 0 ? photoCount : (event.photo_count || 0);
  const venue = event.venue || "CBIT Campus";

  // Build a clean single-line meta string
  const metaParts: string[] = [];
  if (formattedDate) metaParts.push(formattedDate);
  metaParts.push(venue.split(",")[0]!);
  if (actualPhotoCount > 0) metaParts.push(`${actualPhotoCount} Frames`);

  return (
    <div className="w-full relative min-h-[52vh] sm:min-h-[60vh] lg:min-h-[66vh] flex items-end justify-center overflow-hidden bg-[#050208]">
      {/* Full-width Cover Image with Ken Burns */}
      {heroCover ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroCover}
            alt={event.title}
            fill
            unoptimized
            priority
            className="object-cover object-center animate-ken-burns"
            sizes="100vw"
          />
          {/* Strong bottom scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-[#050208]/55 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-transparent z-10 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1055] via-[#120524] to-[#050208] z-0" />
      )}

      {/* Top Left — Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute top-20 sm:top-24 left-4 sm:left-10 z-30"
      >
        <Link
          href="/events"
          className="group inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white bg-black/55 hover:bg-black/80 border border-white/15 hover:border-purple-500/40 transition-all duration-300 px-3 sm:px-4 py-1.5 rounded-full cursor-pointer shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft size={11} className="transition-transform duration-300 group-hover:-translate-x-1 text-[#C084FC]" />
          <span>All Events</span>
        </Link>
      </motion.div>

      {/* Bottom-aligned Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-5 sm:px-10 pb-9 sm:pb-12 flex flex-col items-center text-center gap-2.5 sm:gap-3">

        {/* Category label — tiny, above title */}
        {event.category && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.04 }}
            className="text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase text-[#C084FC]"
          >
            {event.category}
          </motion.p>
        )}

        {/* Event Title — big and bold */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.09 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.05] drop-shadow-[0_6px_40px_rgba(0,0,0,0.95)] max-w-3xl"
        >
          {displayTitle}
        </motion.h1>

        {/* Meta — elegant inline row, no boxes */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.18 }}
          className="flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1"
        >
          {metaParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/25 text-xs">·</span>}
              <span
                className={
                  i === metaParts.length - 1 && actualPhotoCount > 0
                    ? "text-[11px] sm:text-xs font-mono text-[#C084FC] font-semibold"
                    : "text-[11px] sm:text-xs font-mono text-white/70"
                }
              >
                {part}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
