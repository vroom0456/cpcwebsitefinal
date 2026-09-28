"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EventCard } from "@/components/public/event-card";
import { TimelineYearGroup } from "@/lib/services/events.service";
import { formatBytes } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeTimeline({ groupedEvents }: { groupedEvents: TimelineYearGroup[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // A subtle progress line connecting the years
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#050208] py-24 sm:py-32 lg:py-40"
    >
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 relative">
        
        {/* The central track line */}
        <div className="absolute left-6 sm:left-10 lg:left-[50%] top-0 bottom-0 w-[1px] bg-white/[0.05] hidden md:block" />
        <motion.div
          style={{ height: lineHeight }}
          className="absolute left-6 sm:left-10 lg:left-[50%] top-0 w-[2px] bg-gradient-to-b from-cpcLight via-cpcPurple to-transparent hidden md:block origin-top"
        />

        {/* Massive 2026 Typography Background element */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.015] mix-blend-overlay">
          <span className="font-display font-black text-[25vw] md:text-[20vw] leading-none whitespace-nowrap select-none text-[#F8F5FB]">
            {new Date().getFullYear()}
          </span>
        </div>



        <div className="space-y-32">
          {groupedEvents.map((group, groupIndex) => (
            <div key={group.year} className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-24">
              
              {/* Year Metadata (Sticky-ish side) */}
              <div className="md:w-1/3 shrink-0 flex flex-col items-start md:items-end text-left md:text-right pt-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="sticky top-32"
                >
                  <h3 className="text-6xl md:text-8xl font-display font-bold text-white/5 tracking-tighter">
                    {group.year}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cpcLight">
                      {group.events.length} Events
                    </p>
                    <p className="text-xs text-white/40 font-mono uppercase tracking-wider">
                      {group.totalPhotos.toLocaleString("en-US")} Photos
                    </p>
                    {group.totalStorageBytes > 0 && (
                      <p className="text-xs text-white/20 font-mono uppercase tracking-wider">
                        {formatBytes(group.totalStorageBytes)} Archival Data
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Event Cards Grid */}
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
