"use client";

import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomeServiceSummary() {
  useGSAP(() => {
    gsap.to("#title-service-1", {
      xPercent: 20,
      scrollTrigger: {
        trigger: "#title-service-1",
        scrub: true,
      },
    });
    gsap.to("#title-service-2", {
      xPercent: -30,
      scrollTrigger: {
        trigger: "#title-service-2",
        scrub: true,
      },
    });
    gsap.to("#title-service-3", {
      xPercent: 40, // Scaled down slightly for layout safety
      scrollTrigger: {
        trigger: "#title-service-3",
        scrub: true,
      },
    });
    gsap.to("#title-service-4", {
      xPercent: -40, // Scaled down slightly for layout safety
      scrollTrigger: {
        trigger: "#title-service-4",
        scrub: true,
      },
    });
  }, []);

  return (
    <section className="mt-20 overflow-hidden font-amiamie font-light leading-snug text-center mb-42 contact-text-responsive text-black dark:text-white">
      <div id="title-service-1">
        <p>Capture</p>
      </div>
      <div
        id="title-service-2"
        className="flex items-center justify-center gap-3 translate-x-16"
      >
        <p className="font-normal">Post Processing</p>
        <div className="w-10 h-1 md:w-32 bg-sageGreen" />
        <p>Aesthetics</p>
      </div>
      <div
        id="title-service-3"
        className="flex items-center justify-center gap-3 -translate-x-24"
      >
        <p>Dynamic</p>
        <div className="w-10 h-1 md:w-32 bg-sageGreen" />
        <p className="italic">Galleries</p>
        <div className="w-10 h-1 md:w-32 bg-sageGreen" />
        <p>Events</p>
      </div>
      <div id="title-service-4" className="translate-x-24">
        <p>Archive</p>
      </div>
    </section>
  );
}
