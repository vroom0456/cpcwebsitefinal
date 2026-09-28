"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { coverPhotoSrc } from "@/lib/utils";
import type { Event } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const isFeature = index === 0;
  const imgSrc = coverPhotoSrc(event.cover_photo_url, isFeature ? 1200 : 800);

  return (
    <motion.div variants={fadeUp} className={isFeature ? "md:col-span-2" : ""}>
      <Link
        href={`/gallery/${event.id}`}
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#0D0915] border border-white/[0.05] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_24px_80px_-20px_rgba(79,22,142,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight"
        aria-label={`View ${event.title}`}
      >
        {/* Image */}
        <div className={`relative w-full overflow-hidden ${isFeature ? "aspect-[16/7]" : "aspect-[4/3]"}`}>
          <Image
            src={imgSrc}
            alt={event.title}
            fill
            unoptimized
            sizes={isFeature ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
            className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
            priority={index === 0}
          />
          {/* Bottom scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#110C1E]/90 via-[#110C1E]/20 to-transparent" />
          
          {/* Hover arrow */}
          <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F5FB]/10 backdrop-blur-md opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg">
            <ArrowUpRight size={20} className="text-[#F8F5FB]" />
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2 p-5">
          <h3 className={`font-semibold leading-tight text-[#F8F5FB] transition-colors duration-300 group-hover:text-[#9D5EE5] ${isFeature ? "text-[20px]" : "text-[16px]"}`}>
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#F8F5FB]/70">
            {event.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={11} className="text-cpcLight/70" />
                {new Date(event.event_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {event.category && (
              <span className="capitalize px-2 py-0.5 rounded-full bg-[#4F168E]/15 text-[#9D5EE5] text-[11px] font-medium">
                {event.category}
              </span>
            )}
            {event.photo_count > 0 && (
              <span>{event.photo_count} photos</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface HomeWorksProps {
  events: Event[];
}

export function HomeWorks({ events = [] }: HomeWorksProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section
      id="work"
      aria-label="Recent events"
      className="relative overflow-hidden bg-[#050208] py-32 lg:py-40"
    >
      {/* Divider line top */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-white/[0.05]" />

      {/* Subtle center glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse, #4F168E 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={stagger}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-16"
        >
          <div>
            <motion.p variants={fadeIn} className="mb-4 text-[11px] font-semibold tracking-[0.45em] uppercase text-[#9D5EE5]">
              Preserving Memories
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[#F8F5FB]"
            >
              Recent{" "}
              <span className="text-cpcLight">Events</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeIn}>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-[#F8F5FB]/12 px-5 py-2.5 text-[12px] font-semibold text-[#F8F5FB]/60 transition-all duration-300 hover:border-[#F8F5FB]/30 hover:text-[#F8F5FB] active:scale-[0.97]"
            >
              View all events <ArrowUpRight size={13} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Grid */}
        {events.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {events.slice(0, 5).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#F8F5FB]/70 text-center py-24"
          >
            No events published yet.
          </motion.p>
        )}
      </div>
    </section>
  );
}
