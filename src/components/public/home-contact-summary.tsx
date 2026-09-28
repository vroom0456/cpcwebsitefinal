"use client";

import React, { useRef } from "react";
import { Marquee } from "./Marquee";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomeContactSummary() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const items = [
    "Passion",
    "Art",
    "Memories",
    "Community",
    "Precision",
  ];
  
  const items2 = [
    "Contact Us",
    "Contact Us",
    "Contact Us",
    "Contact Us",
    "Contact Us",
  ];

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=500 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="flex flex-col items-center justify-between min-h-screen gap-12 mt-16 font-amiamie bg-white dark:bg-black text-black dark:text-white"
    >
      <Marquee items={items} className="text-black dark:text-white bg-transparent" />
      <div className="overflow-hidden font-light text-center contact-text-responsive leading-tight px-6">
        <p>
          “ Let’s capture <br />
          <span className="font-normal text-sageGreen">memorable</span> &{" "}
          <span className="italic font-normal">inspiring</span> <br />
          moments <span className="text-darkMauve dark:text-sageGreen font-bold">together</span> “
        </p>
      </div>
      <Marquee
        items={items2}
        reverse={true}
        className="text-black dark:text-white bg-transparent border-y-2 border-black/10 dark:border-white/10"
        iconClassName="stroke-sageGreen stroke-2 text-primary"
        icon="material-symbols-light:square"
      />
    </section>
  );
}
