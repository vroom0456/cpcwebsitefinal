"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame, Calendar, MapPin, QrCode } from "lucide-react";
import { coverPhotoSrc, cleanEventTitle, formatEditorialDate } from "@/lib/utils";
import { ShareDialog } from "@/components/public/share-dialog";

interface FeaturedFestProps {
  featuredEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    subfolders?: string[];
    venue?: string | null;
  } | null;
  // Also accept legacy prop name for backward compatibility
  dyuthiEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    subfolders?: string[];
    venue?: string | null;
  } | null;
  recentEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    event_date?: string | null;
    created_at?: string;
    category?: string | null;
    venue?: string | null;
    subfolders?: string[];
  } | null;
}

export function HomeFeaturedFest({ featuredEvent, dyuthiEvent, recentEvent }: FeaturedFestProps) {
  const [activeQR, setActiveQR] = useState<{ url: string; title: string } | null>(null);

  const feat = featuredEvent || dyuthiEvent || {
    id: "1b0748de-9873-4190-a8e2-118c74d5796f",
    title: "DYUTHI 2026",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1u7rX7FEh76q5fgh_9s8YgZnx-Q6TmaFQ",
    photo_count: 3910,
    venue: "CBIT Campus",
  };
  const featCover = feat.cover_photo_url
    ? coverPhotoSrc(feat.cover_photo_url, 1200)
    : "https://lh3.googleusercontent.com/d/1u7rX7FEh76q5fgh_9s8YgZnx-Q6TmaFQ";

  const recent = recentEvent || {
    id: "02f45ec2-c02d-4b26-bf58-5aaa37ac5a32",
    title: "CBIT Annual Fest 2026",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1zfevglQm7DYoAS9zVUJ7K4ahEjV5FW95",
    photo_count: 12040,
    event_date: "2026-02-18",
    category: "Technical Fest",
    venue: "CBIT Campus",
  };
  const recentCover = recent.cover_photo_url
    ? coverPhotoSrc(recent.cover_photo_url, 1200)
    : "https://lh3.googleusercontent.com/d/1zfevglQm7DYoAS9zVUJ7K4ahEjV5FW95";

  const recentTitle = cleanEventTitle(recent.title);
  const featTitle = cleanEventTitle(feat.title);
  const recentDate = formatEditorialDate(recent.event_date || recent.created_at);

  return (
    <>
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
                <Sparkles size={11} />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#C084FC]">
                Latest Coverage &amp; Featured
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
              Recent Event &amp; Featured Fest
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl mt-1">
              Browse our most recently captured photo gallery or dive into the featured festival archive.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#C084FC] hover:text-white transition-colors group self-start sm:self-auto whitespace-nowrap"
          >
            <span>Browse All Events</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid: 1st Latest Covered Event (7 cols) + 2nd Featured/Dyuthi (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* ── CARD 1: LATEST COVERED EVENT (7 COLS - PROMINENT FIRST) ── */}
          <div className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-[#0c0517] border border-purple-500/25 hover:border-purple-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[360px] sm:min-h-[460px]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={recentCover}
                alt={recentTitle}
                fill
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
              />
              {/* Cinematic Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07040F] via-[#07040F]/55 to-black/25 z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9D5EE5]/15 via-transparent to-transparent z-10" />
            </div>

            {/* Top Badges */}
            <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-3 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D5EE5]/25 border border-[#C084FC]/35 text-[10px] font-mono font-bold text-[#F8F5FB] uppercase tracking-wider backdrop-blur-md shadow-lg whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] animate-pulse" />
                Latest Coverage
              </span>

              <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] font-mono font-bold text-white/90 backdrop-blur-md whitespace-nowrap">
                {recent.photo_count.toLocaleString()} Photos
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 p-4 sm:p-6 space-y-2.5 sm:space-y-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C084FC] font-semibold">
                  Recently Archived
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white drop-shadow-lg line-clamp-2">
                  {recentTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 font-sans mt-1">
                  {recentDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-[#C084FC] shrink-0" />
                      <span className="font-mono text-[11px]">{recentDate}</span>
                    </span>
                  )}
                  {recent.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#C084FC] shrink-0" />
                      <span>{recent.venue?.split(",")[0] || "CBIT Campus"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: View Gallery + Branded QR Code */}
              <div className="pt-1 flex items-center gap-2.5">
                <Link
                  href={`/gallery/${recent.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#E8D1FF] transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <span>View Event Photos</span>
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setActiveQR({
                      url: `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${recent.id}`,
                      title: recent.title,
                    })
                  }
                  className="inline-flex items-center justify-center p-2.5 rounded-full bg-white/[0.08] hover:bg-[#9D5EE5]/30 border border-white/20 hover:border-[#C084FC]/50 text-white transition-all shadow-md hover:scale-[1.05] active:scale-[0.95]"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR code"
                >
                  <QrCode size={15} className="text-[#C084FC]" />
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD 2: FEATURED / DYUTHI EVENT (5 COLS - SECOND) ── */}
          <div className="lg:col-span-5 group relative rounded-2xl overflow-hidden bg-[#0c0517] border border-white/10 hover:border-purple-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[360px] sm:min-h-[460px]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={featCover}
                alt={featTitle}
                fill
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
              />
              {/* Cinematic Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07040F] via-[#07040F]/55 to-black/25 z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9D5EE5]/15 via-transparent to-transparent z-10" />
            </div>

            {/* Top Badges */}
            <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-3 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D5EE5]/25 border border-[#C084FC]/35 text-[10px] font-mono font-bold text-[#F8F5FB] uppercase tracking-wider backdrop-blur-md shadow-lg whitespace-nowrap">
                <Flame size={11} className="text-amber-300" />
                Featured Festival
              </span>

              <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] font-mono font-bold text-white/90 backdrop-blur-md whitespace-nowrap">
                {feat.photo_count.toLocaleString()}+ Photos
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 p-4 sm:p-6 space-y-2.5 sm:space-y-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 font-semibold">
                  Annual Campus Showcase
                </p>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white drop-shadow-lg line-clamp-2">
                  {featTitle}
                </h3>
                {feat.venue && (
                  <p className="text-xs text-white/70 font-sans mt-1 flex items-center gap-1">
                    <MapPin size={11} className="text-[#C084FC] shrink-0" />
                    <span>{feat.venue?.split(",")[0] || "CBIT Campus"}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons: View Gallery + Branded QR Code */}
              <div className="pt-1 flex items-center gap-2.5">
                <Link
                  href={`/gallery/${feat.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Explore Festival</span>
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setActiveQR({
                      url: `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${feat.id}`,
                      title: feat.title,
                    })
                  }
                  className="inline-flex items-center justify-center p-2.5 rounded-full bg-white/[0.08] hover:bg-[#9D5EE5]/30 border border-white/20 hover:border-[#C084FC]/50 text-white transition-all shadow-md hover:scale-[1.05] active:scale-[0.95]"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR code"
                >
                  <QrCode size={15} className="text-[#C084FC]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branded Camera-Dial QR Code Dialog */}
      {activeQR && (
        <ShareDialog
          url={activeQR.url}
          title={activeQR.title}
          onClose={() => setActiveQR(null)}
        />
      )}
    </>
  );
}
