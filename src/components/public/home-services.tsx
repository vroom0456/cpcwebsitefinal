"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Camera, BookOpen, Footprints, SlidersHorizontal, ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const servicesData = [
  {
    icon: Camera,
    num: "01",
    title: "Official Media Coverage",
    description:
      "Comprehensive photography and videography coverage for CBIT's flagship events, cultural festivals, technical fests, sports meets, workshops, and seminars — documenting campus life for lasting memories.",
    items: [
      { title: "Event Documentation", description: "Meticulous documentation of student initiatives and fests." },
      { title: "Collaborative Projects", description: "Partnerships with student clubs and campus organizations." },
      { title: "Archival Quality", description: "Preserving every milestone and historic moment of the institute." },
    ],
  },
  {
    icon: BookOpen,
    num: "02",
    title: "Workshops & Mentorship",
    description:
      "Specialized learning forums helping students explore photography beyond basic snapshots — developing technical proficiency, artistic vision, and portfolio building skills.",
    items: [
      { title: "Camera Tech & Basics", description: "Hands-on guidance for exposure, lighting, and framing." },
      { title: "Creative Composition", description: "Mentorship sessions to nurture individual artistic expression." },
      { title: "Portfolio Building", description: "Structuring a professional body of visual work." },
    ],
  },
  {
    icon: Footprints,
    num: "03",
    title: "Creative Challenges",
    description:
      "Outdoor photography walks, competitive photo hunts, and creative prompt challenges designed to push members' creative boundaries and explore new genres.",
    items: [
      { title: "Photography Walks", description: "Exploring street, wildlife, and architectural photography." },
      { title: "Photo Hunts", description: "Competitive prompts to capture specific themes on campus." },
      { title: "Exhibitions & Contests", description: "Opportunities to display work and win club recognition." },
    ],
  },
  {
    icon: SlidersHorizontal,
    num: "04",
    title: "Post-Processing Sessions",
    description:
      "Hands-on training for editing, color grading, and asset management — ensuring visual stories are processed to professional standards with consistency and craft.",
    items: [
      { title: "Editing Sessions", description: "Mastering industry-standard post-processing workflows." },
      { title: "Visual Consistency", description: "Refining aesthetics for social media and official archives." },
      { title: "Community Feedback", description: "Collaborative review to sharpen editing and storytelling skills." },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export function HomeServices() {
  return (
    <section
      id="services"
      aria-label="Our core activities"
      className="relative bg-[#050208] py-32 lg:py-40 border-t border-white/[0.04] overflow-hidden"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #9D5EE5 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-3xl mb-20 text-left"
        >
          <motion.p variants={fadeUp} className="mb-4 text-[11px] font-bold tracking-[0.45em] uppercase text-[#9D5EE5]">
            02 — What We Do
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F8F5FB] mb-6 font-display"
          >
            Our Core <span className="bg-gradient-to-r from-cpcLight to-[#C084FC] bg-clip-text text-transparent font-bold">Activities</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base leading-[1.8] text-[#F8F5FB]/50 font-light max-w-xl"
          >
            Empowering visual storytellers, capturing the spirit of Chaitanya Bharathi Institute of
            Technology through every lens.
          </motion.p>
        </motion.div>

        {/* Sticky service cards */}
        <div className="flex flex-col gap-4 text-left">
          {servicesData.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.85, ease: EASE, delay: index * 0.06 }}
                style={{
                  position: "sticky",
                  top: `calc(100px + ${index * 16}px)`,
                }}
                className="group rounded-[2rem] border border-white/[0.05] bg-[#06030C]/80 backdrop-blur-xl p-8 sm:p-10 lg:p-12 hover:border-cpcLight/20 transition-all duration-500 hover:shadow-[0_0_60px_-20px_rgba(157,94,229,0.15)]"
              >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
                  {/* Left: number, icon, title, desc */}
                  <div className="lg:w-2/5 flex flex-col gap-6 text-left">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cpcLight/8 border border-cpcLight/10 text-cpcLight group-hover:bg-cpcLight/15 group-hover:border-cpcLight/25 transition-all duration-300">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-[11px] text-[#F8F5FB]/25 font-bold tracking-wider">
                        {service.num}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.025em] text-[#F8F5FB] leading-tight group-hover:text-white transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm sm:text-base leading-[1.8] text-[#F8F5FB]/50 font-light group-hover:text-[#F8F5FB]/70 transition-colors">
                      {service.description}
                    </p>

                    {service.num === "01" && (
                      <Link
                        href="/coverage"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/40 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 w-fit hover:scale-105 active:scale-95 shadow-md shadow-purple-950/50 mt-1"
                      >
                        <Camera size={13} className="text-[#C084FC]" />
                        <span>Request Coverage for Your Event</span>
                        <ArrowRight size={13} className="text-white/60" />
                      </Link>
                    )}
                  </div>

                  {/* Right: items list */}
                  <div className="lg:w-3/5 flex flex-col justify-center divide-y divide-white/[0.05] text-left">
                    {service.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5 first:pt-0 last:pb-0">
                        <span className="text-[10px] font-mono text-cpcLight/50 shrink-0 w-6 font-bold">
                          {String(itemIndex + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#F8F5FB]/40 mt-1 font-light leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
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
