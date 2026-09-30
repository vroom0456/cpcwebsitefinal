"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  Command,
  CornerDownLeft,
  FileText,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  Tag,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { coverPhotoSrc, getPhotoDisplayUrl, cn, formatEventDate } from "@/lib/utils";

interface SearchResult {
  events: any[];
  photos: any[];
  members: any[];
}

const PUBLIC_QUICK_NAV = [
  { label: "Photography Events", href: "/events", icon: Calendar, cat: "Explore" },
  { label: "Request Event Coverage", href: "/coverage", icon: Sparkles, cat: "Services" },
  { label: "Submit Campus Buzz", href: "/submit-buzz", icon: Sparkles, cat: "Services" },
];

const ADMIN_QUICK_NAV = [
  { label: "Create New Event", href: "/admin/events/new", icon: Plus, cat: "Quick Action" },
  { label: "Events & Gallery Manager", href: "/admin/events", icon: Calendar, cat: "Management" },
  { label: "Team & Committee Manager", href: "/admin/team", icon: Users, cat: "Management" },
  { label: "Google Drive Storage Sync", href: "/admin/drive", icon: RefreshCw, cat: "Storage & Sync" },
  { label: "Tags & Categories", href: "/admin/tags", icon: Tag, cat: "Settings" },
  { label: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3, cat: "Metrics" },
  { label: "Audit & System Logs", href: "/admin/logs", icon: FileText, cat: "System Logs" },
  { label: "Admin Settings", href: "/admin/settings", icon: Settings, cat: "System Settings" },
];

export function GlobalSearchModal({
  isOpen,
  onClose,
  isAdminOnly = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdminOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ events: [], photos: [], members: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdminMode = isAdminOnly || (pathname ? pathname.startsWith("/admin") : false);
  const currentQuickNav = isAdminMode ? ADMIN_QUICK_NAV : PUBLIC_QUICK_NAV;

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ events: [], photos: [], members: [] });
    }
  }, [isOpen]);

  // Handle global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
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
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const hasResults =
    results.events.length > 0 || results.photos.length > 0 || results.members.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-[#090412]/95 border border-purple-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-5 py-4 border-b border-purple-500/20 bg-white/[0.02]">
              <Search size={18} className="text-[#C084FC] shrink-0 mr-3.5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isAdminMode
                    ? "Search admin tools, events, drive, team..."
                    : "Search events, photos, team, or pages..."
                }
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none font-medium"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults({ events: [], photos: [], members: [] });
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer mr-2"
                >
                  <X size={16} />
                </button>
              ) : null}
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-white/50 shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results / Quick Nav Area */}
            <div className="overflow-y-auto p-4 space-y-4 scrollbar-none flex-1">
              {loading && (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#C084FC] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-white/40 font-mono">
                    Searching {isAdminMode ? "Admin System..." : "CBIT Photo Club..."}
                  </p>
                </div>
              )}

              {!loading && !query && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    {isAdminMode ? <ShieldCheck size={12} /> : <Sparkles size={12} />}
                    {isAdminMode ? "Admin Control Center Shortcuts" : "Quick Shortcuts"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentQuickNav.map((nav) => {
                      const Icon = nav.icon;
                      return (
                        <button
                          key={nav.href}
                          onClick={() => handleNavigate(nav.href)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-[#C084FC] group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                              <Icon size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors">
                                {nav.label}
                              </p>
                              <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
                                {nav.cat}
                              </span>
                            </div>
                          </div>
                          <ArrowRight size={13} className="text-white/20 group-hover:text-[#C084FC] group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loading && query && !hasResults && (
                <div className="py-12 text-center space-y-2">
                  <Search size={24} className="mx-auto text-white/20" />
                  <p className="text-xs font-semibold text-white/70">No results found for &quot;{query}&quot;</p>
                  <p className="text-[10px] text-white/40">Try searching for titles, categories, or members.</p>
                </div>
              )}

              {/* Events Category Results - Visual Event Cards Grid */}
              {!loading && results.events.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-1 flex items-center gap-1.5">
                    <Calendar size={12} /> Events ({results.events.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.events.map((ev) => (
                      <div key={ev.id} className="relative p-[1px] rounded-2xl bg-gradient-to-b from-purple-500/30 via-white/10 to-purple-500/20 group hover:from-purple-500/70 hover:via-purple-400/50 hover:to-purple-600/60 transition-all duration-500 shadow-md">
                        <button
                          type="button"
                          onClick={() =>
                            handleNavigate(
                              isAdminMode
                                ? `/admin/gallery/${ev.id}`
                                : `/gallery/${ev.slug || ev.id}`
                            )
                          }
                          className="relative flex flex-col aspect-[4/3] w-full overflow-hidden rounded-[15px] bg-[#090412] text-left cursor-pointer p-3 justify-between focus-visible:outline-none"
                        >
                          {/* Cover Photo Background */}
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

                          {/* Date Badge and Matched Subfolder */}
                          <div className="relative z-10 flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider text-white/90 border border-purple-500/30 bg-black/60 backdrop-blur-md">
                              {formatEventDate(ev.event_date || ev.created_at)}
                            </span>
                            {ev.matchedSubfolder && (
                              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-medium text-amber-200 border border-amber-500/30 bg-black/70 backdrop-blur-md truncate max-w-[120px]">
                                Folder: {ev.matchedSubfolder}
                              </span>
                            )}
                          </div>

                          {/* Bottom Glassmorphic Title & Venue Box */}
                          <div className="relative z-10 p-2.5 rounded-xl bg-[#090412]/85 backdrop-blur-md border border-white/10 group-hover:border-purple-400/40 transition-colors space-y-0.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors truncate drop-shadow-sm">
                              {ev.title}
                            </h4>
                            {ev.venue && (
                              <p className="text-[10px] text-white/70 font-medium truncate flex items-center gap-1">
                                <MapPin size={9} className="text-[#C084FC] shrink-0" />
                                {ev.venue}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Category Results */}
              {!loading && results.photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    <Camera size={12} /> Photo Captures ({results.photos.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {results.photos.map((p) => {
                      const src = getPhotoDisplayUrl(p);
                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            handleNavigate(
                              isAdminMode
                                ? `/admin/gallery/${p.event_id}`
                                : `/gallery/${p.event_id}`
                            )
                          }
                          className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-purple-950/40 border border-white/5 hover:border-purple-500/40 transition-all text-left cursor-pointer"
                        >
                          <Image
                            src={src}
                            alt={p.filename}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                            <p className="text-[10px] text-white font-mono truncate">{p.filename}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Team / Members Category Results */}
              {!loading && results.members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#C084FC] px-2 flex items-center gap-1.5">
                    <Users size={12} /> Team Members ({results.members.length})
                  </p>
                  <div className="space-y-1">
                    {results.members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          handleNavigate(isAdminMode ? `/admin/team` : `/team`)
                        }
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shrink-0">
                            {m.avatar_url ? (
                              <Image src={m.avatar_url} alt={m.full_name} fill unoptimized className="object-cover" />
                            ) : (
                              <Users size={12} className="text-purple-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors">
                              {m.full_name}
                            </p>
                            <p className="text-[10px] text-white/40">{m.role || "Committee Member"}</p>
                          </div>
                        </div>
                        <CornerDownLeft size={12} className="text-white/20 group-hover:text-[#C084FC] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-5 border-t border-purple-500/20 bg-white/[0.02] flex items-center justify-between text-[11px] text-white/40">
              <span className="flex items-center gap-1 font-mono">
                <Command size={11} className="text-[#C084FC]" />
                {isAdminMode ? "Admin Search Engine Active" : "CBIT Photo Club Search"}
              </span>
              <span className="font-mono text-[10px]">Navigate with ↑↓ • Select with ↵</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
