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

        {/* ── 1. DOMINANT FEATURED FESTIVAL SHOWCASE ── */}
        <div className="mb-10 sm:mb-14">
          <div className="group relative rounded-3xl overflow-hidden bg-[#0c0517] border border-purple-500/30 hover:border-purple-400/60 shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[440px] sm:min-h-[540px]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={featCover}
                alt={featTitle}
                fill
                unoptimized
                priority
                className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform"
              />
              {/* Cinematic Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07040F] via-[#07040F]/60 to-black/30 z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07040F]/80 via-transparent to-transparent z-10" />
            </div>

            {/* Top Badges */}
            <div className="relative z-20 p-5 sm:p-8 flex items-center justify-between gap-3 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10.5px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-md shadow-lg">
                <Flame size={12} className="text-amber-400 fill-amber-400" />
                Featured Event
              </span>

              <span className="px-3.5 py-1.5 rounded-full bg-black/70 border border-white/20 text-[10.5px] font-mono font-bold text-white/90 backdrop-blur-md">
                {feat.photo_count.toLocaleString()}+ Photographs
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 p-5 sm:p-8 max-w-2xl space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C084FC] font-semibold">
                  Annual Campus Showcase
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-xl leading-tight">
                  {featTitle}
                </h3>
                {feat.venue && (
                  <p className="text-xs sm:text-sm text-white/70 font-sans pt-1 flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#C084FC] shrink-0" />
                    <span>{feat.venue?.split(",")[0] || "CBIT Campus"}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons: Explore Festival + Branded QR Code */}
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/gallery/${feat.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-[#E8D1FF] transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Explore Festival</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setActiveQR({
                      url: `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${feat.id}`,
                      title: feat.title,
                    })
                  }
                  className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-[#9D5EE5]/30 border border-white/20 hover:border-[#C084FC]/50 text-white transition-all shadow-md hover:scale-[1.05] active:scale-[0.95]"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR code"
                >
                  <QrCode size={16} className="text-[#C084FC]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. RECENT COVERAGE SHOWCASE BELOW ── */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <h4 className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-white/60">
              Recent Coverage
            </h4>
            <div className="flex-1 h-px bg-white/10" />
            <Link
              href="/events"
              className="text-[11px] font-mono text-[#C084FC] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          <div className="group relative rounded-2xl overflow-hidden bg-[#0c0517] border border-white/10 hover:border-purple-500/40 shadow-xl transition-all duration-300 flex flex-col sm:flex-row justify-between min-h-[220px]">
            {/* Background Image / Left Preview */}
            <div className="relative sm:w-2/5 min-h-[180px] sm:min-h-full overflow-hidden">
              <Image
                src={recentCover}
                alt={recentTitle}
                fill
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/40 to-transparent" />
            </div>

            {/* Right Details */}
            <div className="sm:w-3/5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Latest
                  </span>
                  <span className="text-[10px] font-mono text-white/40">
                    {recent.photo_count.toLocaleString()} Photos
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-[#C084FC] transition-colors line-clamp-2">
                  {recentTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 font-sans">
                  {recentDate && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar size={11} className="text-[#C084FC]" />
                      <span>{recentDate}</span>
                    </span>
                  )}
                  {recent.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#C084FC]" />
                      <span>{recent.venue?.split(",")[0] || "CBIT Campus"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <Link
                  href={`/gallery/${recent.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
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
                  className="inline-flex items-center justify-center p-2.5 rounded-full bg-white/[0.06] hover:bg-[#9D5EE5]/30 border border-white/15 hover:border-[#C084FC]/50 text-white transition-all shadow-md hover:scale-[1.05] active:scale-[0.95]"
                  title="Generate Branded QR Code"
                  aria-label="Generate QR code"
                >
                  <QrCode size={14} className="text-[#C084FC]" />
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
