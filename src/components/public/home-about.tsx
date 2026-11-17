"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface HomeAboutProps {
  eventsCount?: number;
  photosCount?: number;
  eventsThisYear?: number;
}

export function HomeAbout({ eventsCount, photosCount, eventsThisYear }: HomeAboutProps) {
  const stats = [
    { value: eventsCount ? `${eventsCount}+` : "131+", label: "Events Covered" },
    { value: photosCount ? `${Math.floor(photosCount / 1000)}K+` : "30K+", label: "Photos Archived" },
    { value: eventsThisYear ? `${eventsThisYear}+` : "40+", label: "This Year" },
  ];

  return (
    <section
      id="about"
      aria-label="About CPC"
      className="relative overflow-hidden py-16 sm:py-24"
    >
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#9D5EE5] mb-3"
          >
            About CPC
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-4 sm:mb-5"
          >
            Preserving every moment of CBIT since 2014.
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-[15px] sm:text-base leading-[1.75] text-white/50 mb-8"
          >
            The CBIT Photo Club is the official photography body of Chaitanya Bharathi Institute of Technology. 
            Our student team documents campus life, college fests, cultural programs, and academic milestones 
            through dedicated event coverage, workshops, and exhibitions.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            className="flex items-center gap-8 sm:gap-12 mb-8"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-xl sm:text-2xl font-bold text-white font-display stat-value">
                  {s.value}
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/35 font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Link to full about */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors group"
            >
              Learn more about CPC
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
