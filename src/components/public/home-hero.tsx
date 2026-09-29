"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { HomeHeroSearch } from "@/components/public/home-hero-search";

const EASE = [0.16, 1, 0.3, 1] as const;

// EXIF-style ticker data that cycles through
const EXIF_FRAMES = [
  { aperture: "f/1.4", shutter: "1/2000s", iso: "ISO 100", mode: "AV" },
  { aperture: "f/2.8", shutter: "1/500s",  iso: "ISO 400", mode: "M"  },
  { aperture: "f/4.0", shutter: "1/250s",  iso: "ISO 800", mode: "TV" },
  { aperture: "f/1.8", shutter: "1/1000s", iso: "ISO 200", mode: "AV" },
];

function ExifTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % EXIF_FRAMES.length), 3000);
    return () => clearInterval(t);
  }, []);
  const frame = EXIF_FRAMES[index]!;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.25em] text-[#9D5EE5]/70"
      >
        <span className="flex items-center gap-1">
          <span className="text-[#9D5EE5]/40">&#9670;</span>
          {frame.aperture}
        </span>
        <span className="text-white/20">·</span>
        <span>{frame.shutter}</span>
        <span className="text-white/20">·</span>
        <span>{frame.iso}</span>
        <span className="text-white/20">·</span>
        <span className="px-1.5 py-0.5 rounded border border-[#9D5EE5]/30 text-[8px] text-[#C084FC]/60">{frame.mode}</span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Word-by-word animated headline (Fast & Snappy) ── */
function AnimatedHeadline({ children }: { children: string }) {
  const words = children.split(" ");
  return (
    <span className="inline">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "80%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function HomeHero() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      id="home"
      aria-label="Hero"
      className="relative flex items-center min-h-screen overflow-hidden bg-transparent"
    >
      {/* ── Parallax background orbs (desktop only for 60fps performance) ── */}
      <motion.div
        style={{ scale: bgScale }}
        aria-hidden
        className="hidden sm:block pointer-events-none absolute inset-0"
      >
        <div
          className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full opacity-[0.22]"
          style={{
            top: "-15%", right: "-10%",
            background: "radial-gradient(circle, rgba(79,22,142,0.9) 0%, rgba(157,94,229,0.15) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.09]"
          style={{
            background: "radial-gradient(circle, rgba(157,94,229,1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-[60%] right-[10%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full opacity-[0.06] animate-[float-orb_10s_ease-in-out_infinite]"
          style={{
            background: "radial-gradient(circle, rgba(192,132,252,1) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </motion.div>

      {/* ── Floating dust particles (Desktop only) ── */}
      <div aria-hidden className="hidden sm:block pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { size: 3, x: "15%", y: "25%", tx: "30px", ty: "-40px", tx2: "-20px", ty2: "25px", dur: "9s", delay: "0s", opacity: 0.5 },
          { size: 2, x: "75%", y: "15%", tx: "-20px", ty: "30px", tx2: "15px", ty2: "-20px", dur: "11s", delay: "1.5s", opacity: 0.35 },
          { size: 4, x: "85%", y: "65%", tx: "-35px", ty: "-20px", tx2: "25px", ty2: "30px", dur: "13s", delay: "0.7s", opacity: 0.4 },
          { size: 2, x: "25%", y: "75%", tx: "20px", ty: "30px", tx2: "-15px", ty2: "-25px", dur: "10s", delay: "2s", opacity: 0.3 },
          { size: 3, x: "55%", y: "40%", tx: "-25px", ty: "-35px", tx2: "30px", ty2: "20px", dur: "12s", delay: "0.3s", opacity: 0.25 },
          { size: 2, x: "40%", y: "85%", tx: "15px", ty: "-20px", tx2: "-10px", ty2: "15px", dur: "8s", delay: "3s", opacity: 0.4 },
          { size: 3, x: "65%", y: "55%", tx: "25px", ty: "20px", tx2: "-20px", ty2: "-30px", dur: "14s", delay: "1s", opacity: 0.3 },
          { size: 2, x: "10%", y: "60%", tx: "-15px", ty: "25px", tx2: "20px", ty2: "-15px", dur: "9.5s", delay: "4s", opacity: 0.35 },
        ].map((p, i) => (
          <span
            key={i}
            className="dust-particle"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              ["--tx" as string]: p.tx,
              ["--ty" as string]: p.ty,
              ["--tx2" as string]: p.tx2,
              ["--ty2" as string]: p.ty2,
              ["--dur" as string]: p.dur,
              ["--delay" as string]: p.delay,
              ["--opacity" as string]: p.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Noise grain ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Background Typography Shadows (Desktop only) ── */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <span className="absolute top-[20%] left-[-5%] text-[20vw] font-black text-white/[0.006] font-display leading-none tracking-tighter uppercase">
          ISO 6400
        </span>
        <span className="absolute bottom-[10%] right-[-5%] text-[24vw] font-black text-white/[0.006] font-display leading-none tracking-tighter uppercase">
          CPC
        </span>
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 pt-20 sm:pt-32 pb-14 sm:pb-44"
      >
        {/* Eyebrow + EXIF Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-8 mb-6 sm:mb-10"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-block w-5 sm:w-6 h-px bg-cpcLight/60" />
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] sm:tracking-[0.5em] uppercase text-cpcLight/80">
              CBIT Photo Club · Hyderabad
            </p>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <ExifTicker />
        </motion.div>

        {/* Display headline */}
        <h1 className="text-[clamp(2.6rem,9vw,9rem)] font-display font-bold leading-[0.95] tracking-[-0.04em] text-[#F8F5FB] mb-6 sm:mb-10">
          <AnimatedHeadline>Every frame</AnimatedHeadline>
          <br />
          <span className="block overflow-hidden">
            <motion.span
              className="inline-block text-gradient-purple"
              initial={{ y: "80%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
            >
              tells a story.
            </motion.span>
          </span>
        </h1>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.14 }}
          className="max-w-[480px] text-[15px] sm:text-[17px] leading-[1.7] sm:leading-[1.8] font-normal text-[#F8F5FB]/60 mb-6 sm:mb-8"
        >
          The official photography community of Chaitanya Bharathi Institute of Technology — dedicated to visual storytelling and preserving every moment of CBIT.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.18 }}
          className="relative z-40 mb-6 sm:mb-10"
        >
          <HomeHeroSearch />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.22 }}
          className="flex flex-wrap items-center gap-3 sm:gap-6"
        >
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-[11px] sm:text-[13px] font-bold tracking-widest uppercase text-black overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(157,94,229,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Browse Gallery
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
            <div className="absolute inset-0 bg-[#E8D1FF] translate-y-[100%] transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
          </Link>
          <Link
            href="/coverage"
            className="group inline-flex items-center gap-2 rounded-full px-5 sm:px-8 py-2.5 sm:py-3.5 text-[11px] sm:text-[13px] font-bold tracking-widest uppercase text-[#F8F5FB]/70 border border-white/10 hover:border-purple-500/40 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            Request Coverage
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} className="text-[#F8F5FB]/25" />
        </motion.div>
        <span className="text-[9px] font-semibold tracking-[0.4em] uppercase text-[#F8F5FB]/20">Scroll</span>
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
