"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Instagram, ArrowUpRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

const contacts = [
  {
    icon: Mail,
    label: "Email",
    value: "photography_wbc@cbit.ac.in",
    href: "mailto:photography_wbc@cbit.ac.in",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@cbitphotoclub",
    href: "https://www.instagram.com/cbitphotoclub?igsh=cnBwOGg2dXM3ZWk4",
  },
];

export function HomeContact() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative overflow-hidden bg-[#050208] py-32 lg:py-40"
    >
      {/* Top hairline */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-[#F8F5FB]/5" />

      {/* Right glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 w-[500px] h-[500px] opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #4F168E 0%, transparent 70%)" }}
      />

      {/* Background Typography Shadows */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <span className="absolute bottom-[10%] left-[-2%] text-[20vw] font-black text-white/[0.006] font-display leading-none tracking-tighter uppercase">
          CREATE
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.p variants={fadeUp} className="mb-6 text-[11px] font-semibold tracking-[0.45em] uppercase text-[#9D5EE5]">
            Get in touch
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[#F8F5FB] mb-6"
          >
            Let's create
            <br />
            <span className="text-[#4F168E]">together.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-2xl text-[16px] leading-[1.75] text-[#F8F5FB]/70 mb-16 text-pretty">
            Have an event you'd like covered? Want to collaborate or just say hello?
            We'd love to hear from you.
          </motion.p>

          {/* Contact items - Editorial Typography Style */}
          <motion.div variants={stagger} className="flex flex-col w-full max-w-3xl mt-12 border-t border-white/[0.06]">
            {contacts.map((c) => (
              <motion.a
                key={c.label}
                variants={fadeUp}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 sm:py-8 border-b border-white/[0.06] transition-colors hover:border-white/20 focus-visible:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12">
                  <span className="text-[11px] sm:text-[13px] uppercase tracking-[0.3em] font-medium text-white/30 group-hover:text-cpcLight transition-colors w-24">
                    {c.label}
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-[#F8F5FB] group-hover:text-white transition-colors">
                    {c.value}
                  </span>
                </div>
                <div className="hidden sm:flex relative w-12 h-12 rounded-full border border-white/10 items-center justify-center overflow-hidden bg-white/[0.02] group-hover:bg-white group-hover:border-white transition-all duration-500">
                  <ArrowUpRight size={20} className="text-white group-hover:text-black absolute transition-all duration-500 group-hover:translate-x-full group-hover:-translate-y-full" />
                  <ArrowUpRight size={20} className="text-white group-hover:text-black absolute -translate-x-full translate-y-full transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
