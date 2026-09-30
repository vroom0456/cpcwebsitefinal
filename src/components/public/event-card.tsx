"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, Camera, ImageIcon, QrCode } from "lucide-react";
import type { Event } from "@/types/database";
import { coverPhotoSrc, formatEditorialDate, cleanEventTitle } from "@/lib/utils";
import { ShareDialog } from "@/components/public/share-dialog";

export function EventCard({ event, priority }: { event: Event; priority?: boolean }) {
  const [showQR, setShowQR] = useState(false);
  const imgSrc = coverPhotoSrc(event.cover_photo_url, 800);
  const dateStr = formatEditorialDate(event.event_date || event.created_at);
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#090510] via-black/20 to-black/35 pointer-events-none z-10" />

            {/* Top badges bar */}
            <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
              {/* Date Pill */}
              {dateStr && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-white/95 shadow-md">
                  <Calendar size={10} className="text-[#C084FC]" />
                  <span>{dateStr}</span>
                </span>
              )}

              {/* Photo count */}
              {event.photo_count > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-medium text-[#C084FC] shadow-md ml-auto">
                  <ImageIcon size={10} className="text-[#C084FC]" />
                  <span>{event.photo_count} photos</span>
                </span>
              )}
            </div>
          </div>

          {/* Card Content & Details (Uniform heights across all grid columns) */}
          <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 gap-3.5">
            <div className="space-y-2">
              {/* Category pill */}
              <div className="flex items-center justify-between gap-2 min-h-[20px]">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold uppercase tracking-wider text-[#C084FC] bg-[#9D5EE5]/15 border border-[#9D5EE5]/25">
                  {event.category || "Campus Event"}
                </span>

                {event.subfolders && event.subfolders.length > 0 && (
                  <span className="text-[10px] font-mono text-white/50">
                    {event.subfolders.length} {event.subfolders.length === 1 ? "album" : "albums"}
                  </span>
                )}
              </div>

              {/* Title with locked 2-line clamp and baseline alignment */}
              <h3 className="font-display text-[15.5px] sm:text-[16.5px] font-bold leading-snug text-white group-hover:text-[#C084FC] transition-colors duration-200 line-clamp-2 min-h-[2.6rem]">
                {displayTitle}
              </h3>
            </div>

            {/* Bottom Bar: Venue + QR Trigger + View Action (Locked to bottom) */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs mt-auto">
              <span className="flex items-center gap-1.5 text-[11px] text-white/55 truncate max-w-[120px] sm:max-w-[150px]">
                <MapPin size={11} className="text-[#9D5EE5] shrink-0" />
                <span className="truncate">{event.venue?.split(",")[0] || "CBIT Campus"}</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Generate / Share QR Code button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQR(true);
                  }}
                  className="p-1.5 rounded-full bg-white/[0.04] hover:bg-[#9D5EE5]/20 border border-white/10 hover:border-[#C084FC]/40 text-white/60 hover:text-white transition-all duration-200 shadow-sm"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR Code"
                >
                  <QrCode size={13} className="text-[#C084FC]" />
                </button>

                {/* View Photos Action */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] group-hover:bg-[#9D5EE5] border border-white/10 group-hover:border-purple-400/50 text-[11px] font-semibold text-white/90 group-hover:text-white transition-all duration-300 shadow-sm">
                  <span>View Photos</span>
                  <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
