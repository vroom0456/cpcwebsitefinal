"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, ImageIcon } from "lucide-react";
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
    <div className="w-full relative min-h-[38vh] sm:min-h-[52vh] lg:min-h-[62vh] flex items-end justify-center overflow-hidden bg-[#050208]">
      {/* Full-width Cover Image with Ken Burns */}
      {heroCover ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroCover}
            alt={event.title}
            fill
            unoptimized
            priority
            className="object-cover object-center sm:object-[center_20%] animate-ken-burns"
            sizes="100vw"
            data-cursor="image"
          />

          {/* Minimal low gradient at bottom edge only for text legibility - keeps cover photo bright and clear */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050208] via-[#050208]/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/40 to-transparent z-10 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1055] via-[#120524] to-[#050208] z-0" />
      )}

      {/* Floating Category Chip */}
      {event.category && (
        <motion.div
          initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
          animate={{ opacity: 1, rotate: -2, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
          className="absolute top-20 sm:top-28 right-4 sm:right-12 z-20 hidden sm:block"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full glass-purple text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-[#C084FC] border border-purple-400/30 shadow-[0_0_30px_rgba(157,94,229,0.2)] rotate-[-2deg]">
            {event.category}
          </span>
        </motion.div>
      )}

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-screen-xl mx-auto px-3.5 sm:px-10 lg:px-16 pt-16 sm:pt-28 pb-3 sm:pb-8 text-left space-y-2 sm:space-y-3">
        {/* Top Navigation Row: Back button + Minimal Breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Link
              href="/events"
              className="group inline-flex items-center gap-1.5 sm:gap-2 text-[9.5px] sm:text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white bg-black/40 hover:bg-black/70 border border-white/20 hover:border-purple-500/40 transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer shadow-lg backdrop-blur-xl"
            >
              <ArrowLeft size={11} className="transition-transform duration-300 group-hover:-translate-x-1 text-[#C084FC]" />
              <span>All Events</span>
            </Link>
          </motion.div>

          {/* Minimal Breadcrumb (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/40">
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span>/</span>
            <span className="text-[#C084FC] truncate max-w-[260px]">{displayTitle}</span>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="space-y-1.5 sm:space-y-2.5 max-w-5xl"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="text-lg sm:text-3xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight sm:leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] line-clamp-2"
          >
            {displayTitle}
          </motion.h1>

          {/* Metadata Pills */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-white/80"
          >
            {formattedDate && (
              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono font-medium">
                <Calendar size={11} className="text-[#C084FC]" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-medium text-white/90 truncate max-w-[200px] sm:max-w-none">
              <MapPin size={11} className="text-[#C084FC] shrink-0" />
              <span className="truncate">{event.venue || "CBIT Campus"}</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-purple-950/60 backdrop-blur-md border border-purple-500/30 font-mono font-semibold text-white">
              <ImageIcon size={11} className="text-[#C084FC]" />
              <span>{actualPhotoCount}</span>
              {" "}Photos
            </span>
          </motion.div>


        </motion.div>
      </div>
    </div>
  );
}
