"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHeroSearch } from "@/components/public/home-hero-search";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={ref}
      id="home"
      aria-label="Hero"
      className="relative flex items-end overflow-hidden bg-transparent"
      style={{ minHeight: "65vh" }}
    >
      {/* Background gradient orbs — subtle, only 2 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full opacity-[0.18]"
          style={{
            top: "-20%", right: "-10%",
            background: "radial-gradient(circle, rgba(79,22,142,0.9) 0%, rgba(157,94,229,0.12) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-[-15%] left-[-8%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, rgba(157,94,229,1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-12 sm:pb-20"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
          className="flex items-center gap-2.5 mb-5 sm:mb-6"
        >
          <span className="inline-block w-5 h-px bg-white/30" />
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-white/60">
            CBIT Photo Club · Hyderabad
          </p>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="text-[clamp(2.4rem,6vw,5rem)] font-display font-bold leading-[1.05] tracking-[-0.03em] text-white mb-4 sm:mb-5"
        >
          Every frame
          <br />
          <span className="text-gradient-purple">tells a story.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
          className="max-w-xl text-[15px] sm:text-[16px] leading-[1.7] text-white/55 mb-6 sm:mb-8"
        >
          The official photography community of CBIT — dedicated to visual storytelling and preserving every moment on campus.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
          className="relative z-40 mb-6 sm:mb-8"
        >
          <HomeHeroSearch />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
          className="flex flex-row items-center gap-3 sm:gap-4"
        >
          <Link
            href="/events"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 sm:px-7 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-black hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
          >
            Browse Events
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/coverage"
            className="group inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-white/70 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
          >
            Request Coverage
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(248,245,251,0.06), transparent)" }}
      />
    </section>
  );
}
