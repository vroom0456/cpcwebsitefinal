"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Camera } from "lucide-react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeCTA() {
  return (
    <section className="relative w-full py-24 sm:py-32 overflow-hidden border-t border-white/[0.04]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#4F168E]/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tight leading-[1.1] text-white mb-4"
        >
          Capture the unseen.{" "}
          <span className="text-white/35">Frame the impossible.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="text-[14px] sm:text-[15px] text-white/40 mb-10 max-w-lg"
        >
          Join our community of visual storytellers at CBIT.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto"
        >
          <a
            href="https://www.instagram.com/cbitphotoclub"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3 sm:px-8 sm:py-3.5 text-[13px] font-semibold hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
          >
            Follow on Instagram
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <Link
            href="/coverage"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 sm:px-8 sm:py-3.5 text-[13px] font-semibold text-white/60 hover:text-white hover:border-white/30 transition-all duration-200"
          >
            <Camera size={15} />
            Request Coverage
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
