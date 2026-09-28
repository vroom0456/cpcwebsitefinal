"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import { GlobalSearchModal } from "@/components/public/global-search-modal";

// Magnetic Button Wrapper
function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;

const mainNavItems = [
  { label: "Home", href: "/", num: "01" },
  { label: "Events", href: "/events", num: "02" },
  { label: "Archive", href: "/archive", num: "03" },
  { label: "Portfolio", href: "/portfolio", num: "04" },
  { label: "Submit Buzz", href: "/submit-buzz", num: "05" },
  { label: "Request Event Coverage", href: "/coverage", num: "06" },
  { label: "About", href: "/#about", num: "07" },
];

const panelVariants = {
  closed: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.35, ease: EASE },
  },
  open: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.35, ease: EASE },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: 12 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: EASE, delay: i * 0.02 },
  }),
};

const footerVariants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE, delay: 0.1 } },
};

export function PublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 20));

  useEffect(() => { setIsOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    setHash(window.location.hash);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const isNavAdmin = pathname.startsWith("/admin");
  const allNavItems = isNavAdmin
    ? [
        { label: "Overview", href: "/admin", num: "01" },
        { label: "Events", href: "/admin/events", num: "02" },
        { label: "Team", href: "/admin/team", num: "03" },
        { label: "Gallery", href: "/admin/gallery", num: "04" },
        { label: "Analytics", href: "/admin/analytics", num: "05" },
        { label: "Drive Sync", href: "/admin/drive", num: "06" },
        { label: "Tags", href: "/admin/tags", num: "07" },
        { label: "Logs", href: "/admin/logs", num: "08" },
        { label: "Settings", href: "/admin/settings", num: "09" },
        { label: "Public Main Site", href: "/", num: "10" },
      ]
    : mainNavItems;

  const isEventsContext = pathname.startsWith("/events") || pathname.startsWith("/gallery");
  const shouldShowPill = scrolled && isEventsContext && !isNavAdmin;

  return (
    <>
      {/* ─── Floating Pill Header ─── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex justify-center px-2 sm:px-6 transition-all duration-500",
          shouldShowPill ? "top-2 sm:top-3" : "top-0",
          scrolled && !shouldShowPill ? "bg-[#050208]/85 backdrop-blur-2xl border-b border-white/5 shadow-lg shadow-black/40" : ""
        )}
      >
        <div
          className={cn(
            "w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between",
            shouldShowPill
              ? "max-w-4xl rounded-full bg-[#050208]/85 backdrop-blur-2xl border border-purple-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(157,94,229,0.1)] px-3.5 sm:px-4 py-2 sm:py-2.5"
              : "max-w-none px-2 sm:px-4 py-2.5 sm:py-4"
          )}
        >
          {/* Left Area: Logo */}
          <Link
            href={isNavAdmin ? "/admin" : "/"}
            onClick={closeMenu}
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none"
            aria-label={isNavAdmin ? "CBIT Photo Club — Admin Home" : "CBIT Photo Club — back to home"}
          >
            <div className={cn("relative flex-shrink-0 transition-all duration-500 group-hover:opacity-85", shouldShowPill ? "w-7 h-7 sm:w-9 sm:h-9" : "w-9 h-9 sm:w-12 sm:h-12")}>
              <Image
                src="/images/logo.png"
                alt="CBIT Photo Club Logo"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            <div className={cn("flex flex-col justify-center text-left leading-[1.25] font-bold tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-all duration-500", shouldShowPill ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[12px]", "text-white")}>
              <span>CBIT</span>
              <span>Photo</span>
              <span>Club</span>
            </div>
            {isNavAdmin && (
              <span className="ml-1 sm:ml-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#C084FC] glass-purple border border-purple-500/40 flex items-center gap-1 shadow-[0_0_20px_rgba(157,94,229,0.35)] shrink-0">
                ADMIN PORTAL
              </span>
            )}
          </Link>

          {/* Desktop Links (visible when scrolled in pill mode) */}
          {shouldShowPill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex items-center gap-1"
            >
              {mainNavItems.slice(0, 4).map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200",
                      active
                        ? "text-white bg-white/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#9D5EE5]"
                      />
                    )}
                  </Link>
                );
              })}
            </motion.div>
          )}

          {/* Right Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 text-white/90 hover:text-white cursor-pointer group",
                shouldShowPill ? "px-2.5 py-1.5 sm:px-3 sm:py-2" : "px-2.5 sm:px-4 py-1.5 sm:py-2.5",
                isOpen && "opacity-0 pointer-events-none"
              )}
              title="Search (Cmd+K)"
            >
              <Search size={13} className="text-[#C084FC] group-hover:scale-110 transition-transform" />
              <span className={cn("font-bold uppercase tracking-widest text-white/90", shouldShowPill ? "hidden" : "hidden sm:inline text-[11px]")}>
                Search
              </span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-white/50 border border-white/10 ml-1">
                ⌘K
              </kbd>
            </button>

            {/* Quick Action Button (Desktop Only) */}
            {!shouldShowPill && (
              <Link
                href={isNavAdmin ? "/admin/events/new" : "/coverage"}
                className={cn(
                  "hidden md:inline-flex group relative items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-5 py-2.5 text-[11px] font-bold tracking-widest uppercase text-white/90 hover:border-transparent overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
                  isOpen && "opacity-0 pointer-events-none"
                )}
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                  <span>{isNavAdmin ? "+ New Event" : "Request Coverage"}</span>
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-[#E8D1FF] translate-y-[100%] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
              </Link>
            )}

            {/* Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-controls="nav-panel"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              className={cn(
                "group relative flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white/10 hover:border-white/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight cursor-pointer z-[110]",
                shouldShowPill ? "px-2.5 py-1.5 sm:px-3 sm:py-2" : "pl-3 pr-3.5 sm:pl-4 sm:pr-5 py-1.5 sm:py-2.5"
              )}
            >
              <span className={cn("font-bold uppercase tracking-widest text-white/90 group-hover:text-white", shouldShowPill ? "hidden" : "hidden sm:block text-[11px]")}>
                {isOpen ? "Close" : "Menu"}
              </span>
              <div className="relative w-5 h-4 flex items-center justify-center shrink-0">
                <span
                  className="block h-[1.5px] rounded-full bg-white transition-all duration-300 absolute"
                  style={{ width: "20px", transform: isOpen ? "rotate(45deg)" : "translateY(-4px)" }}
                />
                <span
                  className="block h-[1.5px] rounded-full bg-white transition-all duration-300 absolute right-0"
                  style={{ width: isOpen ? "20px" : "12px", transform: isOpen ? "rotate(-45deg)" : "translateY(4px)" }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar — underneath the pill */}
        {shouldShowPill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl h-[1px] overflow-hidden rounded-full"
          >
            <div
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg, #4F168E, #9D5EE5, #C084FC)",
                animation: "scrollProgress linear",
                animationTimeline: "scroll(root)",
              }}
            />
          </motion.div>
        )}
      </motion.header>

      {/* Global Command Palette & Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ─── Backdrop ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[80] bg-[#050208]/80 backdrop-blur-md"
              aria-hidden
            />

            {/* ─── Nav Panel ─── */}
            <motion.nav
              id="nav-panel"
              key="nav-panel"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              aria-label="Main navigation"
              className="fixed top-0 right-0 z-[90] flex flex-col h-screen w-full sm:max-w-[420px] bg-[#06030C] overflow-y-auto scrollbar-none"
              style={{ borderLeft: "1px solid rgba(248,245,251,0.06)" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-white/[0.04]">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#F8F5FB]/40">
                  Navigation Menu
                </p>
              </div>

              {/* Main links */}
              <div className="flex flex-col px-8 pt-8 flex-grow">
                {allNavItems.map((item, i) => {
                  let active = false;
                  const [itemPath, itemHash] = item.href.split("#");
                  if (itemHash) {
                    active = pathname === itemPath && hash === `#${itemHash}`;
                  } else if (item.href === "/") {
                    active = pathname === "/" && (!hash || hash === "");
                  } else {
                    active = pathname.startsWith(item.href);
                  }

                  return (
                    <motion.div
                      key={item.href}
                      custom={i}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          closeMenu();
                          if (itemHash) {
                            setHash(`#${itemHash}`);
                          } else {
                            setHash("");
                          }
                        }}
                        className={cn(
                          "group flex items-baseline justify-between py-4 transition-all duration-300 focus-visible:outline-none",
                          "border-b",
                          active
                            ? "border-cpcPurple/40"
                            : "border-white/[0.04] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="text-[10px] font-mono text-[#F8F5FB]/20 tabular-nums w-5 shrink-0">
                            {item.num}
                          </span>
                          <span
                            className={cn(
                              "font-bold tracking-[-0.03em] transition-colors duration-300",
                              "text-[clamp(1.15rem,3.8vw,1.65rem)] sm:text-2xl leading-none",
                              active
                                ? "text-[#F8F5FB]"
                                : item.label === "Request Event Coverage"
                                ? "text-[#D4A8FF] group-hover:text-[#E8D1FF]"
                                : "text-[#F8F5FB]/40 group-hover:text-[#F8F5FB]"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                        <motion.span
                          className={cn(
                            "text-[#F8F5FB]/20 text-lg transition-transform duration-300",
                            active ? "text-cpcLight" : "group-hover:text-[#F8F5FB]/50"
                          )}
                          animate={{ x: active ? 0 : 0 }}
                        >
                          {active ? "●" : "→"}
                        </motion.span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Contact footer */}
              <motion.div
                variants={footerVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="px-8 pb-10 pt-6"
                style={{ borderTop: "1px solid rgba(248,245,251,0.04)" }}
              >
                <div className="flex flex-col gap-4">
                  {/* Social icon row */}
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.instagram.com/cbitphotoclub"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-purple-500/15 hover:border-purple-500/30 transition-all duration-200 text-[12px] font-semibold"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C084FC]">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      @cbitphotoclub
                    </a>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#F8F5FB]/22 mb-1.5 font-semibold">Email</p>
                    <a
                      href="mailto:photography_wbc@cbit.ac.in"
                      className="text-[13px] text-[#F8F5FB]/55 hover:text-[#F8F5FB] transition-colors duration-200"
                    >
                      photography_wbc@cbit.ac.in
                    </a>
                  </div>

                  {/* CPC Footer Tag */}
                  <div className="pt-2 flex items-center gap-2">
                    <span className="h-px flex-1 bg-white/[0.06]" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">© {new Date().getFullYear()} CPC</span>
                    <span className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                </div>
              </motion.div>
            </motion.nav>

          </>
        )}
      </AnimatePresence>
    </>
  );
}
