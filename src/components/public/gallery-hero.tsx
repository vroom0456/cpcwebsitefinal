"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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

  return (
    <div className="w-full relative min-h-[44vh] sm:min-h-[52vh] lg:min-h-[58vh] flex items-end justify-center overflow-hidden bg-[#050208]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-[#050208]/55 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-transparent z-10 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1055] via-[#120524] to-[#050208] z-0" />
      )}

      {/* Breadcrumb — top left */}
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        aria-label="Breadcrumb"
        className="absolute top-20 sm:top-24 left-4 sm:left-10 z-30"
      >
        <ol className="flex items-center gap-1 text-[10px] sm:text-xs font-medium">
          <li>
            <Link
              href="/events"
              className="text-white/70 hover:text-white transition-colors"
            >
              Events
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={11} className="text-white/30" />
          </li>
          <li>
            <span className="text-white/90 font-semibold truncate max-w-[200px] sm:max-w-[300px] inline-block align-bottom">
              {displayTitle}
            </span>
          </li>
        </ol>
      </motion.nav>

      {/* Bottom-aligned Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-5 sm:px-10 pb-8 sm:pb-11 flex flex-col items-center text-center gap-2">
        {/* Category label */}
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

        {/* Event Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_40px_rgba(0,0,0,0.95)] max-w-3xl"
        >
          {displayTitle}
        </motion.h1>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.16 }}
          className="flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] sm:text-xs font-mono"
        >
          {formattedDate && (
            <span className="text-white/70">{formattedDate}</span>
          )}
          {formattedDate && actualPhotoCount > 0 && (
            <span className="text-white/25">·</span>
          )}
          {actualPhotoCount > 0 && (
            <span className="text-[#C084FC] font-semibold">
              {actualPhotoCount} Frames
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
