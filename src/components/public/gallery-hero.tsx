"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, ImageIcon } from "lucide-react";
import { coverPhotoSrc, formatEventDate } from "@/lib/utils";
import type { Event } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

interface GalleryHeroProps {
  event: Event;
  photoCount: number;
}

function AnimatedCounter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{count}</>;
}

export function GalleryHero({ event, photoCount }: GalleryHeroProps) {
  const heroCover = event.cover_photo_url ? coverPhotoSrc(event.cover_photo_url, 1600) : null;
  const formattedDate = formatEventDate(event.event_date || event.created_at);

  return (
    <div className="w-full relative min-h-[60vh] sm:min-h-[75vh] flex items-end justify-center overflow-hidden bg-[#050208]">
      {/* Full-width Cover Image with Ken Burns */}
      {heroCover ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroCover}
            alt={event.title}
            fill
            unoptimized
            priority
            className="object-cover object-top sm:object-[center_25%] animate-ken-burns"
            sizes="100vw"
            data-cursor="image"
          />

          {/* Multi-stage cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-[#050208]/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050208]/30 to-transparent z-10" />
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent z-10" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#180B30] to-[#050208] z-0" />
      )}

      {/* Floating Category Chip */}
      {event.category && (
        <motion.div
          initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
          animate={{ opacity: 1, rotate: -2, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
          className="absolute top-28 right-8 sm:right-12 z-20 hidden sm:block"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-purple text-[10px] font-bold tracking-[0.35em] uppercase text-[#C084FC] border border-purple-400/30 shadow-[0_0_30px_rgba(157,94,229,0.2)] rotate-[-2deg]">
            {event.category}
          </span>
        </motion.div>
      )}

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pt-28 pb-14 text-left space-y-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/20 hover:border-purple-500/40 transition-all duration-300 px-4 py-2.5 rounded-full cursor-pointer shadow-lg backdrop-blur-xl"
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1 text-[#C084FC]" />
            Back to Catalog
          </button>
        </motion.div>

        {/* Title — letter-spacing spread animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="space-y-5 max-w-5xl"
        >
          <motion.h1
            initial={{ letterSpacing: "-0.08em", opacity: 0 }}
            animate={{ letterSpacing: "-0.02em", opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
            className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold text-white leading-[1.05] drop-shadow-2xl"
          >
            {event.title}
          </motion.h1>

          {/* Metadata Pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 text-xs text-white/70"
          >
            {formattedDate && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 font-medium">
                <Calendar size={13} className="text-[#C084FC]" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 font-medium text-white/90">
              <MapPin size={13} className="text-[#C084FC]" />
              {event.venue || "CBIT Campus, Hyderabad"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9D5EE5]/20 backdrop-blur-md border border-[#9D5EE5]/30 font-mono font-semibold text-white">
              <ImageIcon size={13} className="text-[#C084FC]" />
              <AnimatedCounter target={photoCount} />
              {" "}Captures
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade blend */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050208] to-transparent z-20" />
    </div>
  );
}
