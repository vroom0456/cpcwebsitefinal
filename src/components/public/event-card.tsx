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
  const storageMb = event.storage_bytes
    ? `${(event.storage_bytes / (1024 * 1024)).toFixed(1)} MB`
    : null;

  return (
    <motion.div
      className="h-full block group"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Gradient ring border that glows on hover */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/8 via-white/4 to-transparent group-hover:from-[#C084FC]/70 group-hover:via-purple-400/40 group-hover:to-purple-600/60 transition-all duration-500 shadow-2xl shadow-black/60 group-hover:shadow-[0_30px_70px_-10px_rgba(157,94,229,0.4)] h-full">

        {/* Card Inner */}
        <Link
          href={`/gallery/${event.id}`}
          className="relative flex flex-col h-full overflow-hidden rounded-[23px] bg-[#07030D] focus-visible:outline-none"
          data-cursor="image"
        >
          {/* Top Folder Header Tab Bar (Google Drive Folder Aesthetic) */}
          <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#9D5EE5]/20 border border-[#9D5EE5]/30 flex items-center justify-center shrink-0">
                <Folder size={12} className="text-[#C084FC]" />
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white/60 truncate">
                Drive Folder
              </span>
            </div>

            {/* Date Badge */}
            {dateStr && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-[10px] font-medium text-white/70 shrink-0">
                <Calendar size={10} className="text-[#C084FC]" />
                {dateStr}
              </span>
            )}
          </div>

          {/* Cover image preview */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0514]">
            {event.cover_photo_url ? (
              <Image
                src={imgSrc}
                alt={event.title}
                fill
                unoptimized
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] group-hover:brightness-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#07030D]">
                <Camera size={32} className="text-white/15" />
              </div>
            )}

            {/* Multi-stage vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040108]/95 via-[#040108]/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Category chip — top left */}
            {event.category && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-bold tracking-widest uppercase text-[#C084FC]">
                {event.category}
              </div>
            )}

            {/* Photo count + size — top right */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {event.photo_count > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono font-semibold text-white/80">
                  <ImageIcon size={10} className="text-[#9D5EE5]" />
                  {event.photo_count} photos
                </div>
              )}
              {storageMb && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/50">
                  <HardDrive size={9} className="text-white/40" />
                  {storageMb}
                </div>
              )}
            </div>
          </div>

          {/* Folder Content & Details */}
          <div className="flex flex-col flex-1 justify-between p-5 space-y-4">
            <div className="space-y-2">
              <h3 className="font-display text-[16px] sm:text-[18px] font-bold leading-[1.2] text-white group-hover:text-[#C084FC] transition-colors duration-300 line-clamp-2">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Subfolders list pills */}
              {event.subfolders && event.subfolders.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {event.subfolders.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[10px] text-white/60 font-mono truncate max-w-[140px]"
                    >
                      <Folder size={8} className="text-[#9D5EE5] shrink-0" />
                      {sub}
                    </span>
                  ))}
                  {event.subfolders.length > 3 && (
                    <span className="text-[10px] text-white/40 font-mono self-center">
                      +{event.subfolders.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                {event.venue && (
                  <span className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin size={10} className="text-[#9D5EE5]/70 shrink-0" />
                    {event.venue.split(",")[0]}
                  </span>
                )}
              </div>

              {/* Open Folder Action */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] group-hover:bg-[#9D5EE5] border border-white/10 group-hover:border-purple-400/50 text-[11px] font-medium text-white transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(157,94,229,0.5)]">
                <span>Open Folder</span>
                <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
