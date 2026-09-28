"use client";

import React, { useRef } from "react";
import { AnimatedTextLines } from "./AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface AnimatedHeaderSectionProps {
  subTitle: string;
  title: string;
  text: string;
  textColor: string;
  withScrollTrigger?: boolean;
}

export function AnimatedHeaderSection({
  subTitle,
  title,
  text,
  textColor,
  withScrollTrigger = false,
}: AnimatedHeaderSectionProps) {
  const contextRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];

  useGSAP(() => {
    if (!contextRef.current || !headerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: withScrollTrigger
        ? {
            trigger: contextRef.current,
            start: "top 80%",
          }
        : undefined,
    });
    
    tl.from(contextRef.current, {
      y: "30vh",
      duration: 1,
      ease: "circ.out",
    });
    
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        y: 200,
        duration: 1,
        ease: "circ.out",
      },
      "<+0.2"
    );
  }, []);

  return (
    <div ref={contextRef} className="overflow-hidden">
      <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
        <div
          ref={headerRef}
          className="flex flex-col justify-center gap-12 pt-16 sm:gap-16"
        >
          <p
            className={`text-sm font-light tracking-[0.5rem] uppercase px-10 ${textColor}`}
          >
            {subTitle}
          </p>
          <div className="px-10">
            <h1
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block ${textColor}`}
            >
              {titleParts.map((part, index) => (
                <span key={index}>{part} </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      <div className={`relative px-10 ${textColor} mt-12`}>
        <div className="absolute inset-x-0 border-t-2 opacity-30" />
        <div className="py-12 sm:py-16 text-end">
          <AnimatedTextLines
            text={text}
            className={`font-light uppercase value-text-responsive ${textColor}`}
          />
        </div>
      </div>
    </div>
  );
}
