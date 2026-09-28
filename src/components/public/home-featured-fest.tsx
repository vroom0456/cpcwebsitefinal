"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Folder, Users, Music, Flame, Calendar, Camera } from "lucide-react";
import { coverPhotoSrc } from "@/lib/utils";

interface FeaturedFestProps {
  dyuthiEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    subfolders?: string[];
  } | null;
  sudheeEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    subfolders?: string[];
  } | null;
}

export function HomeFeaturedFest({ dyuthiEvent, sudheeEvent }: FeaturedFestProps) {
  // Fallback IDs if database query didn't find them
  const dyuthiId = dyuthiEvent?.id || "1b0748de-9873-4190-a8e2-118c74d5796f";
  const dyuthiCount = dyuthiEvent?.photo_count || 3910;
  const dyuthiCover = dyuthiEvent?.cover_photo_url
    ? coverPhotoSrc(dyuthiEvent.cover_photo_url, 1200)
    : "https://lh3.googleusercontent.com/d/1u7rX7FEh76q5fgh_9s8YgZnx-Q6TmaFQ";

  const sudheeId = sudheeEvent?.id || "02f45ec2-c02d-4b26-bf58-5aaa37ac5a32";
  const sudheeCount = sudheeEvent?.photo_count || 12040;
  const sudheeCover = sudheeEvent?.cover_photo_url
    ? coverPhotoSrc(sudheeEvent.cover_photo_url, 1200)
    : "https://lh3.googleusercontent.com/d/1zfevglQm7DYoAS9zVUJ7K4ahEjV5FW95";

  return (
    <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="p-1 rounded-md bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
              <Sparkles size={13} className="animate-pulse" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.3em] uppercase text-[#C084FC]">
              Flagship CBIT Festivals
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
            Special Fest Archives
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl mt-2 font-normal">
            Explore complete multi-day coverage of CBIT&apos;s biggest cultural and technical extravaganzas with nested day-wise subfolders and high-res concert albums.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#C084FC] hover:text-white transition-colors group self-start sm:self-auto"
        >
          <span>All 126+ Events</span>
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Featured Fests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* ── DYUTHI 2026 (Grand Flagship Hero Card - 7 cols) ── */}
        <div className="lg:col-span-7 group relative rounded-3xl overflow-hidden bg-[#0c0517] border border-purple-500/25 hover:border-purple-400/50 shadow-[0_20px_50px_rgba(79,22,142,0.25)] hover:shadow-[0_25px_60px_rgba(157,94,229,0.35)] transition-all duration-500 flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={dyuthiCover}
              alt="DYUTHI 2026 CBIT Mega Cultural Fest"
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Gradient Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06020c] via-[#06020c]/60 to-black/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/40 to-transparent z-10" />
          </div>

          {/* Top Badges */}
          <div className="relative z-20 p-5 sm:p-7 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/80 border border-purple-400/50 text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider backdrop-blur-md shadow-lg">
                <Flame size={12} className="text-amber-300" />
                Annual Cultural Fest
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] font-mono text-white/70 backdrop-blur-md">
                <Calendar size={11} className="text-[#C084FC]" />
                Feb 2026
              </span>
            </div>

            <span className="px-3 py-1 rounded-full bg-black/60 border border-purple-500/40 text-[11px] font-mono font-bold text-[#C084FC] backdrop-blur-md">
              {dyuthiCount.toLocaleString()}+ Captures
            </span>
          </div>

          {/* Bottom Content & Subfolder Explorer */}
          <div className="relative z-20 p-5 sm:p-7 space-y-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C084FC] font-semibold mb-1">
                Flagship Mega Cultural Festival
              </p>
              <h3 className="text-2xl sm:text-4xl font-display font-bold text-white drop-shadow-lg">
                DYUTHI 2026
              </h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-lg mt-1.5 line-clamp-2">
                Featuring the legendary SS. Thaman live concert, electrifying Battle of the Bands, celebrity dance showcases, and complete batch portraits.
              </p>
            </div>

            {/* Direct Nested Subfolder Action Pills */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Folder size={11} className="text-[#C084FC]" /> Quick Jump into Subfolders:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Day - 2", icon: <Calendar size={11} /> },
                  { name: "SS.THAMAN Concert", icon: <Music size={11} className="text-amber-300" />, sub: "Day - 2/SS.THAMAN" },
                  { name: "Battle of bands", icon: <Flame size={11} className="text-purple-300" />, sub: "Day - 2/Battle of bands" },
                  { name: "Group Photos", icon: <Users size={11} className="text-emerald-300" />, sub: "Day - 2/Group Photos" },
                  { name: "Day-1", icon: <Calendar size={11} />, sub: "Day-1" },
                ].map((pill, idx) => (
                  <Link
                    key={idx}
                    href={`/gallery/${dyuthiId}${pill.sub ? `?subfolder=${encodeURIComponent(pill.sub)}` : ""}`}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-purple-600/40 border border-white/10 hover:border-purple-400 text-[11px] font-mono text-white/80 hover:text-white transition-all backdrop-blur-md hover:scale-105"
                  >
                    {pill.icon}
                    <span>{pill.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Action Button */}
            <div className="pt-2">
              <Link
                href={`/gallery/${dyuthiId}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-black font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-[#E8D1FF] transition-all duration-200 shadow-xl shadow-purple-950/40"
              >
                <span>Enter Dyuthi 2026 Archive</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── SUDHEE 2026 (CBIT Annual Fest - 5 cols) ── */}
        <div className="lg:col-span-5 group relative rounded-3xl overflow-hidden bg-[#0c0517] border border-white/10 hover:border-purple-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={sudheeCover}
              alt="CBIT ANNUAL FEST 2026 Sudhee"
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06020c] via-[#06020c]/70 to-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/50 to-transparent z-10" />
          </div>

          {/* Top Badges */}
          <div className="relative z-20 p-5 sm:p-7 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={11} className="text-amber-300" />
              Annual Technical Fest
            </span>

            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono font-bold text-white/80 backdrop-blur-md">
              {sudheeCount.toLocaleString()}+ Captures
            </span>
          </div>

          {/* Bottom Content & Subfolder Explorer */}
          <div className="relative z-20 p-5 sm:p-7 space-y-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50 font-semibold mb-1">
                National Level Technical Symposium
              </p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white drop-shadow-lg">
                CBIT ANNUAL FEST 2026
              </h3>
              <p className="text-xs text-white/70 max-w-sm mt-1 line-clamp-2">
                Sudhee 26 national hackathons, robotic wars, department symposiums, and celebratory campus moments.
              </p>
            </div>

            {/* Direct Subfolders */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Folder size={11} className="text-[#C084FC]" /> Subfolders:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "DAY-1 (17 Feb)", sub: "Sudhee 26/DAY-1 (17 FEB 2026)" },
                  { name: "DAY-2 (18 Feb)", sub: "Sudhee 26/DAY-2  (18 FEB 2026)" },
                  { name: "SYNAPSE", sub: "Sudhee 26/DAY-1 (17 FEB 2026)/SYNAPSE" },
                  { name: "Civilization", sub: "Sudhee 26/DAY-1 (17 FEB 2026)/Civilization" },
                ].map((pill, idx) => (
                  <Link
                    key={idx}
                    href={`/gallery/${sudheeId}?subfolder=${encodeURIComponent(pill.sub)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.07] hover:bg-purple-600/30 border border-white/10 hover:border-purple-400 text-[10px] sm:text-[11px] font-mono text-white/80 hover:text-white transition-all backdrop-blur-md"
                  >
                    <span>{pill.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Link
                href={`/gallery/${sudheeId}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400 text-white font-bold text-xs tracking-wide uppercase transition-all duration-200"
              >
                <span>Browse Sudhee Archive</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
