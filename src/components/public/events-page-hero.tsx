"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const words = ["Portraits", "Landscapes", "Events", "Stories", "Moments", "Culture"];

export function EventsPageHero() {
  return (
    <div className="relative overflow-hidden pt-36 pb-16 px-6 sm:px-10 lg:px-16">
      {/* Floating ghost words */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {words.map((w, i) => (
          <motion.span
            key={w}
            className="absolute text-[11px] font-semibold uppercase tracking-[0.3em] select-none"
            style={{
              top: `${15 + i * 13}%`,
              left: `${(i % 2 === 0 ? 5 : 68) + i * 2}%`,
              color: "rgba(157,94,229,0.06)",
            }}
            animate={{ y: [0, -10, 0], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          >
            {w}
          </motion.span>
        ))}
      </div>

      <div className="relative max-w-screen-xl mx-auto">
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.4em] uppercase"
            style={{
              background: "rgba(79,22,142,0.15)",
              border: "1px solid rgba(157,94,229,0.3)",
              backdropFilter: "blur(12px)",
              color: "rgba(192,132,252,0.9)",
            }}>
            <Camera size={10} />
            All Galleries
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.08 }}
          className="text-[clamp(3rem,9vw,7rem)] font-display font-bold leading-[0.92] tracking-[-0.04em] text-[#F8F5FB] mb-6"
        >
          Events
          <span className="block text-gradient-purple text-[0.45em] font-normal tracking-[-0.01em] mt-2">
            Photography Archive
          </span>
        </motion.h1>

        {/* Subtitle + stat */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
          className="flex flex-wrap items-center gap-4"
        >
          <p className="text-[14px] text-[#F8F5FB]/45 max-w-sm leading-relaxed">
            Every gallery the club has published — searchable, filterable, and perfectly archived.
          </p>
          <div className="h-px flex-1 max-w-[100px]"
            style={{ background: "linear-gradient(90deg, rgba(157,94,229,0.3), transparent)" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
