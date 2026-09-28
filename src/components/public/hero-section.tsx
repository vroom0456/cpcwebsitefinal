"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div className="container relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground"
        >
          Chaitanya Bharathi Institute of Technology
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl font-semibold tracking-tight sm:text-7xl"
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
        >
          {siteConfig.description}
        </motion.p>
      </div>
    </section>
  );
}
