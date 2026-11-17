"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
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

export function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 20));

  useEffect(() => { setIsOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isNavAdmin = pathname.startsWith("/admin");

  return (
    <>
      {/* ─── Fixed Header ─── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#050208]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/40"
            : "bg-transparent"
        )}
      >
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
          {/* Logo with 3-line stacked typography */}
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

          {/* Desktop Nav Links (All Public Pages) */}
          {!isNavAdmin && (
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              {allPublicNavPages.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200",
                      active
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
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

          {/* Compact links for medium screens (lg/md) */}
          {!isNavAdmin && (
            <nav className="hidden md:flex xl:hidden items-center gap-1" aria-label="Compact navigation">
              {[
                { label: "Events", href: "/events" },
                { label: "Timeline", href: "/timeline" },
                { label: "Archive", href: "/archive" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "About", href: "/about" },
              ].map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-2.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors",
                      active ? "text-white bg-white/10" : "text-white/60 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs transition-all cursor-pointer"
              title="Search events (Cmd+K)"
              aria-label="Search events"
            >
              <Search size={13} className="text-[#C084FC]" />
              <span className="hidden sm:inline font-medium">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/50 border border-white/10 ml-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Request Coverage CTA Pill */}
            {!isNavAdmin && (
              <Link
                href="/coverage"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <span>Request Coverage</span>
                <ArrowRight size={12} />
              </Link>
            )}

            {/* Mobile Menu Drawer Toggle (hidden on desktop where links are already present) */}
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="flex md:hidden items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              {isOpen ? (
                <X size={16} />
              ) : (
                <div className="flex flex-col gap-1 w-4 items-center">
                  <span className="block h-[1.5px] w-4 bg-white rounded-full" />
                  <span className="block h-[1.5px] w-3 bg-white rounded-full self-start" />
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
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#0A0510] border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 shrink-0">
                      <Image
                        src="/images/logo.png"
                        alt="CPC Logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-white">
                      Navigation
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

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
                          "flex items-center justify-between py-3 px-3.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                          active
                            ? "bg-white/10 text-white font-semibold"
                            : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />}
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-md"
                >
                  <span>Request Coverage</span>
                  <ArrowRight size={13} />
                </Link>

                <p className="text-[10px] text-white/30 text-center font-mono">
                  CBIT Photography Club · Est. 2014
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
