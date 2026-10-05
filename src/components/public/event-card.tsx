"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ArrowUpRight, Camera, ImageIcon, QrCode } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc, resolveEventDate, cleanEventTitle } from "@/lib/utils";
import { ShareDialog } from "@/components/public/share-dialog";

export function EventCard({ event, priority }: { event: Event; priority?: boolean }) {
  const [showQR, setShowQR] = useState(false);
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = resolveEventDate(event);
  const displayTitle = cleanEventTitle(event.title);

  return (
    <>
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
          {/* Cover image preview with larger aspect ratio and minimal low gradient */}
          <div className="relative aspect-[16/11] overflow-hidden bg-[#0A0514]">
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

            {/* Subtle low gradient strictly at bottom edge to ground photo cleanly */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#090510]/85 to-transparent pointer-events-none z-10" />

            {/* Photo count indicator (minimal subtle glass badge) */}
            {event.photo_count > 0 && (
              <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-medium text-white/90 shadow-md">
                  <ImageIcon size={10} className="text-[#C084FC]" />
                  <span>{event.photo_count}</span>
                </span>
              </div>
            )}
          </div>

          {/* Card Content: Just Name and Date, refined typography without location or tags */}
          <div className="flex flex-col flex-1 justify-between p-3.5 sm:p-4 gap-2.5">
            <h3 className="font-display text-[15px] sm:text-[16px] font-bold leading-snug text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-1">
              {displayTitle}
            </h3>

            {/* Bottom Bar: Date on Left, Action on Right */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-auto">
              {dateStr ? (
                <span className="flex items-center gap-1.5 text-[11px] text-white/60 font-mono">
                  <Calendar size={11} className="text-[#C084FC] shrink-0" />
                  <span>{dateStr}</span>
                </span>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Generate / Share QR Code button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQR(true);
                  }}
                  className="p-1.5 rounded-full bg-white/[0.04] hover:bg-[#9D5EE5]/20 border border-white/10 hover:border-[#C084FC]/40 text-white/60 hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR Code"
                >
                  <QrCode size={12} className="text-[#C084FC]" />
                </button>

                {/* View Photos Action */}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.04] group-hover:bg-[#9D5EE5] border border-white/10 group-hover:border-purple-400/50 text-[10.5px] font-semibold text-white/90 group-hover:text-white transition-all duration-300 shadow-sm">
                  <span>View</span>
                  <ArrowUpRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Branded Camera-Dial QR Code Dialog */}
      {showQR && (
        <ShareDialog
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${event.id}`}
          title={event.title}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}
