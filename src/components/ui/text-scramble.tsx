"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";

const DEFAULT_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?-=[];,./";

export interface TextScrambleProps {
  text: string;
  trigger?: "load" | "hover" | "inView" | "manual";
  duration?: number;
  characters?: string;
  stagger?: number; // Delay between character locks (in ms)
  className?: string;
}

export function TextScramble({
  text,
  trigger = "load",
  duration = 800,
  characters = DEFAULT_CHARACTERS,
  stagger = 30,
  className,
}: TextScrambleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "10%" });
  
  const [displayChars, setDisplayChars] = useState<string[]>(Array.from(text).map(() => ""));
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation state refs to avoid stale closures in requestAnimationFrame
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  const originalChars = Array.from(text);

  const scramble = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    startTimeRef.current = performance.now();
    
    // Total animation time = duration + (stagger * text.length)
    // We want the last character to finish at exactly `totalTime`.
    
    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      
      let allLocked = true;
      
      const nextChars = originalChars.map((char, i) => {
        if (char === " ") return " ";
        
        // Each character starts scrambling immediately, but locks at its specific staggered time.
        // The lock time for character `i` is proportional to `duration`, but staggered by `stagger * i`.
        const lockTime = duration + i * stagger;
        
        if (elapsed >= lockTime) {
          return char;
        }
        
        allLocked = false;
        
        // Randomize the character every few frames (approx every 30-50ms)
        // Math.random() is fast enough, but we can throttle the character swap slightly 
        // to make it more readable, or just do it every frame. Every frame is requested.
        return characters[Math.floor(Math.random() * characters.length)] || characters[0] || "A";
      });
      
      setDisplayChars(nextChars);
      
      if (!allLocked) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
  }, [characters, duration, isAnimating, originalChars, stagger]);

  // Handle Triggers
  useEffect(() => {
    if (trigger === "load") {
      scramble();
    }
  }, [trigger, scramble]);

  useEffect(() => {
    if (trigger === "inView" && isInView) {
      scramble();
    }
  }, [trigger, isInView, scramble]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={cn("inline-block", className)}
      onMouseEnter={() => {
        if (trigger === "hover") scramble();
      }}
    >
      {originalChars.map((char, i) => {
        if (char === " ") {
          return (
            <span key={i} className="inline-block whitespace-pre">
              {" "}
            </span>
          );
        }

        const displayChar = displayChars[i] || "";
        const isLocked = displayChar === char;

        return (
          <span key={i} className="relative inline-block">
            {/* Invisible original character sets the exact width & line height */}
            <span className="invisible">{char}</span>
            {/* Scrambled character perfectly centered over the invisible one */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                !isLocked && "opacity-80" // subtle opacity change during scramble
              )}
            >
              {displayChar}
            </span>
          </span>
        );
      })}
    </span>
  );
}
