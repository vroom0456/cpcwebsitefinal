"use client";

import React, { useRef } from "react";
import { AnimatedHeaderSection } from "./AnimatedHeaderSection";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const currentCore = [
  {
    role: "President",
    names: ["Adarsh"],
  },
  {
    role: "Vice President",
    names: ["Sowmya"],
  },
  {
    role: "General Secretaries",
    names: ["Nanda Kishore", "Medha Bonu"],
  },
  {
    role: "Joint Secretaries",
    names: ["Indradeep Roy", "Aumer Ali"],
  },
  {
    role: "Heads - Events & Documentation",
    names: ["Rashmith Sheela", "Sai Sankeerth Reddy", "Hamsini"],
  },
  {
    role: "Heads - Social Media & PR",
    names: ["Mahitha Vedantam", "Ram Sri Varun"],
  },
  {
    role: "Heads - Design Team",
    names: ["Samiksha", "Kevin Tejas", "Varun Teja Cherukuthota"],
  },
  {
    role: "Heads - Post Processing",
    names: ["Suryateja Jangli", "Niteesh"],
  },
];

const formerCore = [
  { role: "President", name: "Adithya Gella" },
  { role: "Vice President", name: "Vishnu Vardhan" },
  { role: "General Secretary", name: "Dedeepya Nethi" },
  { role: "Creative Lead", name: "Veerender Nath" },
  { role: "Media Head", name: "Prasuna Gollapudi" },
  { role: "Events Head", name: "Sameera Kethini" },
];

export function HomeLeadership() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".leadership-card", {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".leadership-grid",
        start: "top 85%",
      },
    });

    gsap.from(".former-row", {
      x: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".former-table",
        start: "top 85%",
      },
    });
  }, []);

  const text = `Guided by visionaries, driven by creators. Meet the team steering visual storytelling and design at CBIT.`;

  return (
    <section
      ref={containerRef}
      id="leadership"
      className="flex flex-col min-h-screen pb-24 font-amiamie bg-white dark:bg-black text-black dark:text-white transition-colors duration-500"
    >
      <AnimatedHeaderSection
        subTitle="Leadership & Legacy"
        title="Committee"
        text={text}
        textColor="text-black dark:text-white"
        withScrollTrigger={true}
      />

      {/* Current Core Committee */}
      <div className="px-10 mt-12 leadership-grid">
        <h2 className="text-2xl font-light uppercase tracking-[0.25em] mb-10 text-darkMauve dark:text-sageGreen text-center">
          Current Core Committee (2026–27)
        </h2>

        {/* President Tier (Highest Authority) */}
        <div className="flex justify-center mb-10">
          {currentCore
            .filter((item) => item.role === "President")
            .map((item, index) => (
              <div
                key={index}
                className="leadership-card border border-black/10 dark:border-white/10 hover:border-sageGreen dark:hover:border-sageGreen p-8 rounded-3xl transition-all duration-300 bg-black/5 dark:bg-white/5 backdrop-blur-sm group flex flex-col justify-center items-center min-w-[300px] md:min-w-[400px] text-center"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-black/50 dark:text-white/40 mb-3 group-hover:text-darkMauve dark:group-hover:text-sageGreen transition-colors">
                  {item.role}
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  {item.names.map((name, nIndex) => (
                    <h3
                      key={nIndex}
                      className="font-amiamie-round font-black text-3xl lg:text-4xl leading-tight text-black dark:text-white"
                    >
                      {name}
                    </h3>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Equal Level Tier (Rest of the Core) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentCore
            .filter((item) => item.role !== "President")
            .map((item, index) => (
              <div
                key={index}
                className="leadership-card border border-black/10 dark:border-white/10 hover:border-sageGreen dark:hover:border-sageGreen p-6 rounded-3xl transition-all duration-300 bg-black/5 dark:bg-white/5 backdrop-blur-sm group flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 mb-3 group-hover:text-darkMauve dark:group-hover:text-sageGreen transition-colors">
                    {item.role}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {item.names.map((name, nIndex) => (
                      <h3
                        key={nIndex}
                        className="font-amiamie-round font-black text-xl lg:text-2xl leading-tight text-black dark:text-white"
                      >
                        {name}
                      </h3>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Former Core Committee */}
      <div className="px-10 mt-24">
        <h2 className="text-2xl font-light uppercase tracking-[0.25em] mb-10 text-darkMauve dark:text-sageGreen">
          Former Core Committee
        </h2>
        <div className="border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 backdrop-blur-sm former-table">
          <div className="grid grid-cols-2 px-8 py-4 border-b border-black/10 dark:border-white/10 text-xs uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold">
            <div>Role</div>
            <div>Name</div>
          </div>
          {formerCore.map((member, index) => (
            <div
              key={index}
              className="former-row grid grid-cols-2 px-8 py-4 border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-light text-base lg:text-lg"
            >
              <div className="text-black/60 dark:text-white/60 lowercase tracking-wider">
                {member.role}
              </div>
              <div className="font-amiamie-round font-black text-black dark:text-white uppercase">
                {member.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
