"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { HomeHeroSearch } from "@/components/public/home-hero-search";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

// EXIF-style ticker data that cycles through
const EXIF_FRAMES = [
  { aperture: "f/1.4", apertureTip: "Depth of Field · Wide Aperture", shutter: "1/2000s", shutterTip: "Motion Frozen · High Speed", iso: "ISO 100", isoTip: "Base Sensitivity · Maximum Detail", mode: "AV", modeTip: "Aperture Priority" },
  { aperture: "f/2.8", apertureTip: "Sharp Subject Isolation", shutter: "1/500s", shutterTip: "Balanced Street Shutter", iso: "ISO 400", isoTip: "Indoor / Low Noise Balance", mode: "M", modeTip: "Full Manual Control" },
  { aperture: "f/4.0", apertureTip: "Edge-to-Edge Field Sharpness", shutter: "1/250s", shutterTip: "Standard Handheld", iso: "ISO 800", isoTip: "Evening Atmosphere", mode: "TV", modeTip: "Shutter Priority" },
  { aperture: "f/1.8", apertureTip: "Cinematic Bokeh", shutter: "1/1000s", shutterTip: "Bright Sunlight Action", iso: "ISO 200", isoTip: "Clean Sensor Response", mode: "AV", modeTip: "Aperture Priority" },
];

function ExifTicker() {
  const [index, setIndex] = useState(0);
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % EXIF_FRAMES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const frame = EXIF_FRAMES[index]!;

  return (
    <div className="relative inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5 sm:gap-3 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#9D5EE5]/80"
        >
          {/* Aperture */}
          <span
            onMouseEnter={() => setHoveredTip(frame.apertureTip)}
            onMouseLeave={() => setHoveredTip(null)}
            className="flex items-center gap-1 cursor-help hover:text-white transition-colors"
          >
            <span className="text-[#9D5EE5]/40">&#9670;</span>
            {frame.aperture}
          </span>
          <span className="text-white/20">·</span>

          {/* Shutter */}
          <span
            onMouseEnter={() => setHoveredTip(frame.shutterTip)}
            onMouseLeave={() => setHoveredTip(null)}
            className="cursor-help hover:text-white transition-colors"
          >
            {frame.shutter}
          </span>
          <span className="text-white/20">·</span>

          {/* ISO */}
          <span
            onMouseEnter={() => setHoveredTip(frame.isoTip)}
            onMouseLeave={() => setHoveredTip(null)}
            className="cursor-help hover:text-white transition-colors"
          >
            {frame.iso}
          </span>
          <span className="text-white/20">·</span>

          {/* Mode */}
          <span
            onMouseEnter={() => setHoveredTip(frame.modeTip)}
            onMouseLeave={() => setHoveredTip(null)}
            className="px-1.5 py-0.5 rounded border border-[#9D5EE5]/30 text-[8px] text-[#C084FC]/70 cursor-help hover:border-purple-400 hover:text-white transition-all"
          >
            {frame.mode}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Interactive Tooltip on Hover */}
      <AnimatePresence>
        {hoveredTip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-7 left-0 z-50 whitespace-nowrap px-2.5 py-1 rounded-md bg-[#0F071D] border border-purple-500/40 text-[9px] font-mono font-bold tracking-wider text-[#C084FC] shadow-lg pointer-events-none"
          >
            {hoveredTip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CameraFocusBracket() {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLocked(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/50">
      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded border border-white/10 bg-white/[0.02]">
        <span>[</span>
        <motion.span
          animate={{ scale: locked ? [1, 1.4, 1] : [0.8, 1.2, 0.8] }}
          transition={{ duration: locked ? 0.3 : 0.8, repeat: locked ? 0 : Infinity }}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            locked ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-purple-400"
          )}
        />
        <span>]</span>
        <span className={cn("ml-1 font-bold", locked ? "text-emerald-400" : "text-white/60")}>
          {locked ? "AF LOCK" : "FOCUS"}
        </span>
      </div>
    </div>
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
        {/* Eyebrow + EXIF Ticker + Camera Focus Bracket */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 sm:mb-10"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-block w-5 sm:w-6 h-px bg-cpcLight/60" />
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] sm:tracking-[0.5em] uppercase text-cpcLight/80">
              CBIT Photo Club · Hyderabad
            </p>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <ExifTicker />
          <div className="hidden md:block h-4 w-px bg-white/10" />
          <div className="hidden md:block">
            <CameraFocusBracket />
          </div>
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

        {/* CTAs: Side-by-side with matched balanced width & mobile compact sizing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.22 }}
          className="flex flex-row items-center gap-2.5 sm:gap-4 w-full sm:w-auto"
        >
          <Link
            href="/events"
            className="flex-1 sm:flex-initial group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white px-3.5 sm:px-7 py-2 sm:py-3 text-[10.5px] sm:text-[13px] font-bold tracking-wider sm:tracking-widest uppercase text-black overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_24px_-4px_rgba(255,255,255,0.3)] hover:shadow-[0_0_28px_-4px_rgba(157,94,229,0.5)] whitespace-nowrap text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
              Browse Events
              <ArrowRight
                size={13}
                className="transition-transform duration-200 group-hover:translate-x-1 shrink-0"
              />
            </span>
            <div className="absolute inset-0 bg-[#E8D1FF] translate-y-[100%] transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
          </Link>
          <Link
            href="/coverage"
            className="flex-1 sm:flex-initial group inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-7 py-2 sm:py-3 text-[10.5px] sm:text-[13px] font-bold tracking-wider sm:tracking-widest uppercase text-[#F8F5FB]/80 border border-white/15 hover:border-purple-500/40 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap text-center"
          >
            Request Coverage
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
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
