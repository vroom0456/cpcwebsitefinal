"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Search, X } from "lucide-react";
import { GlobalSearchModal } from "@/components/public/global-search-modal";

const EASE = [0.16, 1, 0.3, 1] as const;

export const allPublicNavPages = [
  { label: "Home", href: "/", num: "01" },
  { label: "Events", href: "/events", num: "02" },
  { label: "Timeline", href: "/timeline", num: "03" },
  { label: "Archive", href: "/archive", num: "04" },
  { label: "Portfolio", href: "/portfolio", num: "05" },
  { label: "About", href: "/about", num: "06" },
  { label: "Coverage", href: "/coverage", num: "07" },
  { label: "Submit Buzz", href: "/submit-buzz", num: "08" },
];

export const primaryNavLinks = [
  { label: "Events", href: "/events" },
  { label: "Timeline", href: "/timeline" },
  { label: "Archive", href: "/archive" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Continuous, silky smooth scroll interpolation without React re-render lag
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 90], [0, 0.94]);
  const borderOpacity = useTransform(scrollY, [0, 90], [0, 0.1]);
  const backdropBlur = useTransform(scrollY, [0, 90], ["blur(0px)", "blur(24px)"]);

  useEffect(() => { setIsOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isNavAdmin = pathname.startsWith("/admin");

  return (
    <>
      {/* ─── Fixed Header with 3-Zone Architecture ─── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 select-none"
      >
        {/* Continuous scroll-interpolated background */}
        <motion.div
          className="absolute inset-0 -z-10 bg-[#08080B] pointer-events-none shadow-lg shadow-black/40"
          style={{
            opacity: bgOpacity,
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: useTransform(borderOpacity, (o) => `rgba(255, 255, 255, ${o})`),
            backdropFilter: backdropBlur,
            WebkitBackdropFilter: backdropBlur,
          }}
        />

        {/* Soft top scrim for readability over bright hero photos */}
        <div className="absolute inset-x-0 top-0 h-28 -z-20 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-18 sm:h-20 gap-3">
          {/* ZONE 1: Left Brand Lockup */}
          <div className="flex items-center justify-start">
            <Link
              href={isNavAdmin ? "/admin" : "/"}
              className="flex items-center gap-3 group focus-visible:outline-none shrink-0"
              aria-label="CBIT Photo Club — Home"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="CBIT Photo Club Logo"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
              <div className="flex flex-col justify-center text-left leading-[1.25] font-bold tracking-[0.4em] uppercase text-white transition-opacity group-hover:opacity-90">
                <span className="text-[11px] sm:text-[12px]">CBIT</span>
                <span className="text-[11px] sm:text-[12px]">Photo</span>
                <span className="text-[11px] sm:text-[12px]">Club</span>
              </div>
              {isNavAdmin && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase text-[#C084FC] glass-purple border border-purple-500/40 shrink-0">
                  Admin
                </span>
              )}
            </Link>
          </div>

          {/* ZONE 2: Center Main Navigation (Mathematically & Optically Centered) */}
          <div className="flex items-center justify-center">
            {!isNavAdmin && (
              <nav className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-md shadow-inner" aria-label="Main navigation">
                {primaryNavLinks.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-200",
                        active
                          ? "text-white bg-white/15 font-semibold shadow-sm"
                          : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-pill-active"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full bg-[#C084FC]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* ZONE 3: Right Action Area (Matched with Nav Pill Sizing) */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
            {/* Standard Search Trigger - Proportional with Nav Links */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 text-white/75 hover:text-white text-[13px] font-medium transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              title="Search events (Cmd+K)"
              aria-label="Search events"
            >
              <Search size={14} className="text-[#C084FC]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/50 border border-white/10 ml-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Request Coverage CTA Pill - Matched Sizing */}
            {!isNavAdmin && (
              <Link
                href="/coverage"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-white/90 text-black text-[13px] font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <span>Request Coverage</span>
                <ArrowRight size={13} />
              </Link>
            )}

            {/* Mobile Menu Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="flex lg:hidden items-center justify-center w-8.5 h-8.5 rounded-full border border-white/15 bg-white/[0.04] hover:border-[#7032B5]/50 hover:bg-[#7032B5]/15 text-white transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
            >
              {isOpen ? (
                <X size={16} />
              ) : (
                <div className="flex flex-col gap-1 w-3.5 items-center">
                  <span className="block h-[1.5px] w-3.5 bg-white rounded-full transition-all" />
                  <span className="block h-[1.5px] w-2.5 bg-[#C084FC] rounded-full self-start transition-all" />
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ─── Drawer Menu (All Pages) ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
              onClick={closeMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#08080B]/98 backdrop-blur-2xl border-l border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl shadow-purple-950/20"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 -z-10 rounded-full bg-[radial-gradient(circle,rgba(112,50,181,0.15)_0%,transparent_70%)] pointer-events-none" />

              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 shrink-0">
                      <Image
                        src="/images/logo.png"
                        alt="CPC Logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col justify-center text-left leading-[1.2] font-bold tracking-[0.35em] uppercase text-white">
                      <span className="text-[10px]">CBIT</span>
                      <span className="text-[10px]">Photo</span>
                      <span className="text-[10px]">Club</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    aria-label="Close menu"
                    className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Mobile Quick Search Button */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-500/30 text-white/60 hover:text-white transition-all text-xs cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <Search size={14} className="text-[#C084FC]" />
                    <span>Search events & gallery...</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 group-hover:text-white/60">
                    ⌘K
                  </span>
                </button>

                {/* All Nav Links with numbers */}
                <nav className="space-y-1">
                  {allPublicNavPages.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          "flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                          active
                            ? "bg-purple-950/40 border border-purple-500/30 text-white font-semibold shadow-sm"
                            : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />}
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[11px] font-mono text-white/30 group-hover:text-white/60">
                          {item.num}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer CTA */}
              <div className="pt-6 border-t border-white/[0.06] space-y-3">
                <Link
                  href="/coverage"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-md active:scale-[0.99]"
                >
                  <span>Request Coverage</span>
                  <ArrowRight size={13} />
                </Link>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-white/35">
                  <span>EST. 2014</span>
                  <span className="text-white/20">·</span>
                  <span>HYDERABAD, INDIA</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
