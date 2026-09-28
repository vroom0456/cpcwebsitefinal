"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextLinesProps {
  text: string;
  className?: string;
}

export function AnimatedTextLines({ text, className }: AnimatedTextLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  useGSAP(() => {
    const validLines = lineRefs.current.filter((el) => el !== null);
    if (validLines.length > 0) {
      gsap.from(validLines, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });
    }
  }, [lines]);

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <span
          key={index}
          ref={(el) => {
            lineRefs.current[index] = el;
          }}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line}
        </span>
      ))}
    </div>
  );
}
