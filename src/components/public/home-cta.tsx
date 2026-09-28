"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Camera } from "lucide-react";
import { useRef, useState } from "react";
import Link from "next/link";

export function HomeCTA() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <section className="relative w-full bg-[#050208] py-32 md:py-48 overflow-hidden border-t border-white/[0.04]">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[#4F168E]/10 blur-[150px]" />
      </div>

      {/* Background Typography Shadows */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <span className="absolute top-[20%] right-[-5%] text-[24vw] font-black text-white/[0.005] font-display leading-none tracking-tighter uppercase">
          50mm
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-semibold tracking-[0.4em] uppercase text-[#9D5EE5] mb-6"
        >
          03 — Join The Community
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter leading-[1.05] text-[#F8F5FB] mb-12 max-w-3xl"
        >
          Capture the unseen. <br />
          <span className="text-[#F8F5FB]/40">Frame the impossible.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="https://www.instagram.com/cbitphotoclub"
            target="_blank"
            rel="noreferrer"
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="group relative inline-flex items-center justify-center gap-3 bg-white text-black rounded-full px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base font-bold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(157,94,229,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight"
          >
            <span className="relative z-10 flex items-center gap-2">
              Follow us on Instagram
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
            <div className="absolute inset-0 bg-[#E8D1FF] translate-y-[100%] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
          </motion.a>
          <Link
            href="/coverage"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base font-bold text-[#F8F5FB]/60 hover:text-white hover:border-white/30 transition-all duration-300"
          >
            <Camera size={16} />
            Request Coverage
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
