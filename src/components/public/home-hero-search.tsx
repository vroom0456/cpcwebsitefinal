"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Calendar,
  Camera,
  Users,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  FileText,
  MapPin,
} from "lucide-react";
import { coverPhotoSrc, getPhotoDisplayUrl, cn, formatEventDate } from "@/lib/utils";

interface SearchResult {
  events: any[];
  photos: any[];
  members: any[];
}

const QUICK_NAV = [
  { label: "Browse Events", href: "/events", icon: Calendar },
  { label: "Request Coverage", href: "/coverage", icon: Sparkles },
  { label: "Submit Buzz", href: "/submit-buzz", icon: Camera },
  { label: "About Leadership", href: "/#about", icon: Users },
];

export function HomeHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({ events: [], photos: [], members: [] });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query fetcher
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ events: [], photos: [], members: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = useCallback(
    (href: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const hasResults =
    results.events.length > 0 || results.photos.length > 0 || results.members.length > 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-xl z-40 transition-all duration-300",
        isOpen && "mb-[260px] sm:mb-[300px]"
      )}
    >
      {/* ── Main Inline Search Input Bar ── */}
      <div className="relative flex items-center rounded-full bg-[#0A0514]/90 hover:bg-[#0D071A] border border-purple-500/30 focus-within:border-[#C084FC] backdrop-blur-2xl transition-all duration-200 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 sm:px-5 py-3 sm:py-3.5 group">
        <Search size={17} className="text-[#C084FC] shrink-0 mr-3 group-focus-within:scale-110 transition-transform" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search events, photos, team, or pages…"
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none font-medium"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults({ events: [], photos: [], members: [] });
              inputRef.current?.focus();
            }}
            className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer mr-1.5 shrink-0"
          >
            <X size={15} />
          </button>
        ) : null}
        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-white/50 shrink-0">
          ESC
        </kbd>
      </div>

      {/* ── Instant Autocomplete Suggestion Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0A0514]/98 border border-purple-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden z-50 max-h-[50vh] sm:max-h-[60vh] flex flex-col"
          >
            <div className="overflow-y-auto p-4 space-y-4 scrollbar-none">
              {loading && (
                <div className="py-6 text-center space-y-2">
                  <div className="w-5 h-5 border-2 border-[#C084FC] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-white/40 font-mono">Searching CBIT Photo Club…</p>
                </div>
              )}

              {!loading && !query && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    <Sparkles size={12} /> Quick Suggestions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {QUICK_NAV.map((nav) => {
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.href}
                          onClick={() => handleNavigate(nav.href)}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-purple-500/10 text-[#C084FC] group-hover:bg-purple-500/20">
                              <Icon size={13} />
                            </div>
                            <span className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors">
                              {nav.label}
                            </span>
                          </div>
                          <ArrowRight size={12} className="text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loading && query && !hasResults && (
                <div className="py-8 text-center space-y-1">
                  <Search size={22} className="mx-auto text-white/20" />
                  <p className="text-xs font-semibold text-white/70">No results found for &quot;{query}&quot;</p>
                  <p className="text-[10px] text-white/40">Try searching for event titles, camera models, or members.</p>
                </div>
              )}

              {/* Events Suggestions - Visual Event Cards Grid */}
              {!loading && results.events.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-1 flex items-center gap-1.5">
                    <Calendar size={12} /> Events ({results.events.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.events.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => handleNavigate(`/gallery/${ev.slug || ev.id}`)}
                        className="group relative flex flex-col aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0B0515] border border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-xl text-left cursor-pointer p-3 justify-between"
                      >
                        {/* Cover Photo Background - Ditto size & aspect ratio */}
                        {ev.cover_photo_url ? (
                          <Image
                            src={coverPhotoSrc(ev.cover_photo_url, 800)}
                            alt={ev.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-black" />
                        )}

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-0" />

                        {/* Strict DD-MM-YYYY Date Badge Top-Left */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider text-white/90 border border-purple-500/30 bg-black/60 backdrop-blur-md">
                            {formatEventDate(ev.event_date || ev.created_at)}
                          </span>
                        </div>

                        {/* Bottom Glassmorphic Title & Venue Box */}
                        <div className="relative z-10 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 space-y-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors truncate drop-shadow-sm">
                            {ev.title}
                          </h4>
                          {ev.matchedSubfolder && (
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono text-[#C084FC] bg-purple-500/20 border border-purple-500/30 truncate max-w-[200px]">
                                Folder: {ev.matchedSubfolder}
                              </span>
                            </div>
                          )}
                          {ev.venue && (
                            <p className="text-[10px] text-white/70 font-medium truncate flex items-center gap-1">
                              <MapPin size={9} className="text-[#C084FC] shrink-0" />
                              {ev.venue}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Suggestions */}
              {!loading && results.photos.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    <Camera size={12} /> Photos ({results.photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {results.photos.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate(`/gallery/${p.event_id}`)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-purple-950/40 border border-white/10 hover:border-purple-500/40 transition-all text-left cursor-pointer"
                      >
                        <Image
                          src={getPhotoDisplayUrl(p)}
                          alt={p.filename}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Suggestions */}
              {!loading && results.members.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    <Users size={12} /> Team ({results.members.length})
                  </p>
                  <div className="space-y-1">
                    {results.members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleNavigate("/#about")}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-[#C084FC] font-bold text-xs flex items-center justify-center border border-purple-500/30">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors">
                              {m.name}
                            </p>
                            <p className="text-[10px] text-white/40 capitalize">
                              {m.position.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                        <ArrowRight size={12} className="text-white/20 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
