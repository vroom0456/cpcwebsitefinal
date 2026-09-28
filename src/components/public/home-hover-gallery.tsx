"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Event } from "@/types/database";
import { coverPhotoSrc } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
  id: number;
  imgIndex: number;
}

export function HomeHoverGallery({ events }: { events: Event[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const idCounter = useRef(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const trailImages = useMemo(() => {
    const urls = events
      .map(e => e.cover_photo_url ? coverPhotoSrc(e.cover_photo_url) : null)
      .filter(Boolean) as string[];
    
    if (urls.length === 0) {
      return ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"];
    }
    return urls;
  }, [events]);

  useEffect(() => {
    // Automatically clear oldest images to keep DOM light and effect smooth
    if (points.length > 8) {
      const timer = setTimeout(() => {
        setPoints((prev) => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [points]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only add a new image if mouse has moved a certain distance
    if (lastPoint.current) {
      const dist = Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y);
      if (dist < 100) return; // distance threshold
    }

    const imgIndex = idCounter.current % trailImages.length;
    const newPoint: Point = {
      x,
      y,
      id: idCounter.current++,
      imgIndex,
    };

    lastPoint.current = { x, y };
    setPoints((prev) => [...prev, newPoint]);
  };

  const EASE = [0.16, 1, 0.3, 1] as const;

  return (
    <section 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative w-full py-32 sm:py-40 bg-[#050208] flex flex-col items-center justify-center overflow-hidden border-t border-white/[0.04] cursor-crosshair min-h-[80vh]"
    >
      {/* Background massive typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
        <h2 className="text-[25vw] font-black tracking-tighter text-[#F8F5FB]">
          {new Date().getFullYear()}
        </h2>
      </div>

      <div className="relative z-10 text-center px-6 text-[#F8F5FB] max-w-4xl mx-auto pointer-events-none select-none">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs font-bold tracking-[0.4em] uppercase text-[#9D5EE5] mb-4"
        >
          Hover to Reveal
        </motion.p>
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight"
        >
          We Freeze Time.
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="max-w-2xl mx-auto mt-8 text-[#F8F5FB]/50 text-lg md:text-xl leading-relaxed"
        >
          We are a community of visual storytellers capturing the essence of campus life. From grand events to quiet moments, we document the history of CBIT, one frame at a time.
        </motion.p>
      </div>

      {/* Image Trail */}
      <AnimatePresence mode="popLayout">
        {points.map((pt) => (
          <motion.div
            key={pt.id}
            initial={{ opacity: 0, scale: 0.3, rotate: (Math.random() - 0.5) * 40 }}
            animate={{ opacity: 1, scale: 1, rotate: (Math.random() - 0.5) * 20 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 15, stiffness: 100, mass: 0.8 }}
            className="absolute pointer-events-none rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black"
            style={{
              width: "260px",
              height: "340px",
              left: pt.x,
              top: pt.y,
              x: "-50%",
              y: "-50%",
              zIndex: pt.id,
            }}
          >
            <Image
              src={trailImages[pt.imgIndex]!}
              alt="Hover trail image"
              fill
              className="object-cover will-change-transform"
              unoptimized
            />
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 mix-blend-overlay" />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
