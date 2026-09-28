"use client";

import { motion } from "framer-motion";
import { Camera, Layers, Eye, Zap } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const styles = [
  {
    icon: Eye,
    title: "Street & Candid",
    desc: "Sensing the quiet, unscripted moments of campus life as they unfold naturally.",
    settings: "f/2.8 · 1/250s · ISO 400",
    num: "01",
    glow: "rgba(157, 94, 229, 0.15)",
  },
  {
    icon: Camera,
    title: "Fine Art & Portraiture",
    desc: "Sculpting light, depth, and character to elevate personality into art.",
    settings: "f/1.8 · 1/200s · ISO 200",
    num: "02",
    glow: "rgba(212, 168, 255, 0.15)",
  },
  {
    icon: Zap,
    title: "Action & Sports",
    desc: "Freezing rapid movement, dynamic athletic plays, and high-energy festivals.",
    settings: "f/4.0 · 1/1000s · ISO 1600",
    num: "03",
    glow: "rgba(79, 22, 142, 0.25)",
  },
  {
    icon: Layers,
    title: "Landscape & Architecture",
    desc: "Capturing details, structures, and symmetry that construct CBIT's campus.",
    settings: "f/8.0 · 1/125s · ISO 100",
    num: "04",
    glow: "rgba(157, 94, 229, 0.15)",
  },
];

export function HomeStats() {
  return (
    <section className="relative w-full bg-[#050208] py-32 md:py-40 overflow-hidden border-t border-white/[0.04]">
      {/* Background Typography Shadows */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <span className="absolute top-[10%] left-[-5%] text-[20vw] font-black text-white/[0.005] font-display leading-none tracking-tighter uppercase">
          FOCUS
        </span>
        <span className="absolute bottom-[10%] right-[-5%] text-[22vw] font-black text-white/[0.005] font-display leading-none tracking-tighter uppercase">
          SHUTTER
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Section Header */}
        <div className="max-w-2xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-[11px] font-semibold tracking-[0.45em] uppercase text-[#9D5EE5] mb-6"
          >
            02 — The Craft
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.03em] leading-none text-white mb-6"
          >
            How we freeze <span className="text-cpcLight">moments.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="text-[16px] leading-[1.8] text-[#F8F5FB]/65"
          >
            Behind every photo lies a blend of timing, perspective, and technical parameters. 
            We approach our photography with a clear creative vision.
          </motion.p>
        </div>

        {/* Interactive Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {styles.map((style, i) => {
            const Icon = style.icon;
            return (
              <motion.div
                key={style.num}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.85, ease: EASE, delay: i * 0.12 }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
                className="group relative flex flex-col justify-between p-8 rounded-[2rem] border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.025] hover:border-[#9D5EE5]/50 transition-all duration-500 overflow-hidden min-h-[320px] hover:shadow-[0_20px_60px_-15px_rgba(157,94,229,0.3)]"
              >
                {/* Sweeping top-edge glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9D5EE5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Background glow circle that appears on hover */}
                <div
                  className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ backgroundColor: style.glow }}
                />

                {/* Top Row: Icon and Number */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[#9D5EE5] group-hover:bg-[#9D5EE5]/10 group-hover:text-white transition-all duration-300">
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-xs text-[#F8F5FB]/20 font-bold group-hover:text-[#9D5EE5]/60 transition-colors">
                    {style.num}
                  </span>
                </div>

                {/* Bottom Row: Text content */}
                <div className="mt-16 z-10 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cpcLight transition-colors">
                    {style.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-[#F8F5FB]/55 group-hover:text-[#F8F5FB]/75 transition-colors mb-6">
                    {style.desc}
                  </p>
                  
                  {/* EXIF Data Badge */}
                  <div className="inline-flex w-fit items-center rounded-lg bg-white/[0.03] border border-white/[0.05] px-3.5 py-1.5 font-mono text-[10.5px] text-[#9D5EE5] group-hover:border-[#9D5EE5]/30 group-hover:bg-[#9D5EE5]/5 group-hover:text-white transition-all duration-300">
                    {style.settings}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
