"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Folder, Users, Music, Flame, Calendar, Camera, MapPin } from "lucide-react";
import { coverPhotoSrc } from "@/lib/utils";

interface FeaturedFestProps {
  dyuthiEvent?: {
    id: string;
    title: string;
    cover_photo_url: string | null;
    photo_count: number;
    subfolders?: string[];
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
  } | null;
}

export function HomeFeaturedFest({ dyuthiEvent, recentEvent }: FeaturedFestProps) {
  const dyuthiId = dyuthiEvent?.id || "1b0748de-9873-4190-a8e2-118c74d5796f";
  const dyuthiCount = dyuthiEvent?.photo_count || 3910;
  const dyuthiCover = dyuthiEvent?.cover_photo_url
    ? coverPhotoSrc(dyuthiEvent.cover_photo_url, 1200)
    : "https://lh3.googleusercontent.com/d/1u7rX7FEh76q5fgh_9s8YgZnx-Q6TmaFQ";

  const recent = recentEvent || {
    id: "02f45ec2-c02d-4b26-bf58-5aaa37ac5a32",
    title: "CBIT Annual Fest 2026 - Sudhee",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1zfevglQm7DYoAS9zVUJ7K4ahEjV5FW95",
    photo_count: 12040,
    event_date: "2026-02-18",
    category: "Technical Fest",
    venue: "CBIT Campus",
  };
  const recentCover = recent.cover_photo_url
    ? coverPhotoSrc(recent.cover_photo_url, 800)
    : "https://lh3.googleusercontent.com/d/1zfevglQm7DYoAS9zVUJ7K4ahEjV5FW95";

  return (
    <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
              <Sparkles size={11} />
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#C084FC]">
              Featured &amp; Recent
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            Flagship Fest &amp; Latest Upload
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl mt-1">
            Access Dyuthi 2026 or browse our most recently published event gallery.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#C084FC] hover:text-white transition-colors group self-start sm:self-auto"
        >
          <span>Browse All 126+ Events</span>
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid: Dyuthi (7 cols) + Recent Upload (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* ── DYUTHI (Flagship Hero Card - 7 cols) ── */}
        <div className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-[#0c0517] border border-purple-500/25 hover:border-purple-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[300px] sm:min-h-[440px]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={dyuthiCover}
              alt="DYUTHI 2026 Cultural Fest"
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06020c] via-[#06020c]/60 to-black/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/40 to-transparent z-10" />
          </div>

          {/* Top Badges */}
          <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-600/80 border border-purple-400/50 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md shadow-lg">
              <Flame size={11} className="text-amber-300" />
              Flagship Fest
            </span>

            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 border border-purple-500/40 text-[10px] font-mono font-bold text-[#C084FC] backdrop-blur-md">
              {dyuthiCount.toLocaleString()}+ Photos
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-20 p-4 sm:p-6 space-y-2.5 sm:space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C084FC] font-semibold">
                Annual Mega Cultural Festival
              </p>
              <h3 className="text-xl sm:text-3xl font-display font-bold text-white drop-shadow-lg">
                DYUTHI 2026
              </h3>
              <p className="hidden sm:block text-xs text-white/70 max-w-lg mt-1 line-clamp-2">
                Concert photo coverage, Battle of the Bands, celebrity performances, and student portraits.
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <Link
                href={`/gallery/${dyuthiId}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E8D1FF] transition-all duration-200 shadow-lg"
              >
                <span>Open Dyuthi Gallery</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── RECENTLY UPLOADED EVENT (Small Sleek Box - 5 cols) ── */}
        <div className="lg:col-span-5 group relative rounded-2xl overflow-hidden bg-[#0c0517] border border-white/10 hover:border-purple-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[260px] sm:min-h-[440px]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={recentCover}
              alt={recent.title}
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06020c] via-[#06020c]/70 to-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 to-transparent z-10" />
          </div>

          {/* Top Badges */}
          <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 uppercase tracking-wider backdrop-blur-md">
              <Camera size={11} />
              Latest Upload
            </span>

            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 border border-white/15 text-[10px] font-mono font-bold text-white/80 backdrop-blur-md">
              {recent.photo_count} Photos
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-20 p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 font-semibold">
                Recently Archived
              </p>
              <h3 className="text-lg sm:text-2xl font-display font-bold text-white drop-shadow-lg line-clamp-2">
                {recent.title}
              </h3>
              {recent.venue && (
                <p className="text-[11px] text-white/60 font-sans mt-0.5 flex items-center gap-1">
                  <MapPin size={10} className="text-[#C084FC]" />
                  {recent.venue}
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <Link
                href={`/gallery/${recent.id}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200"
              >
                <span>View Latest Event</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
