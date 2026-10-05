"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  CheckSquare,
  Loader2,
  X,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Folder,
  Columns,
  LayoutGrid,
  Users,
  Crown,
  Heart,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { useSelectionStore } from "@/store/selection-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadPhotosAsZip } from "@/lib/utils/download";
import { ShareDialog } from "@/components/public/share-dialog";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/database";

interface SubfolderItem {
  name: string;
  fullPath: string;
  count: number;
}

export interface GalleryToolbarProps {
  eventTitle: string;
  photos: Photo[];
  filteredPhotos: Photo[];
  driveFolderId?: string | null;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  favoritesOnly?: boolean;
  onToggleFavoritesOnly?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeTab?: "all" | "group" | "chief" | "favorites";
  onTabChange?: (tab: "all" | "group" | "chief" | "favorites") => void;
  selectedCamera?: string;
  onCameraChange?: (cam: string) => void;
  availableCameras?: string[];
  groupPhotosCount?: number;
  chiefGuestCount?: number;
  visibleSubfolders?: SubfolderItem[];
  selectedSubfolder?: string;
  onSelectSubfolder?: (subfolder: string) => void;
  layoutMode?: "masonry" | "grid";
  onLayoutChange?: (mode: "masonry" | "grid") => void;
  isAdmin?: boolean;
  onResetFilters?: () => void;
}

export function GalleryToolbar({
  eventTitle,
  photos,
  filteredPhotos,
  driveFolderId,
  selectMode,
  onToggleSelectMode,
  searchQuery = "",
  onSearchChange,
  activeTab = "all",
  onTabChange,
  selectedCamera = "all",
  onCameraChange,
  availableCameras = [],
  groupPhotosCount = 0,
  chiefGuestCount = 0,
  visibleSubfolders = [],
  selectedSubfolder = "all",
  onSelectSubfolder,
  layoutMode = "masonry",
  onLayoutChange,
  isAdmin = false,
  onResetFilters,
}: GalleryToolbarProps) {
  const { selectedIds, clear, toggle } = useSelectionStore();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [downloading, setDownloading] = useState<{ done: number; total: number } | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [downloadPromptOpen, setDownloadPromptOpen] = useState(false);

  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));

  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  async function handleSync() {
    setIsSyncing(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/drive/sync-public", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: "error", text: data.error ?? "Sync failed" });
      } else {
        setFeedbackMsg({
          type: "success",
          text: `Synced! ${data.eventsDiscovered} events, ${data.eventsCreated} new.`,
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Sync request failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDownload(target: Photo[], zipName: string) {
    if (target.length === 0) return;
    const controller = new AbortController();
    setAbortController(controller);
    setDownloading({ done: 0, total: target.length });
    setFeedbackMsg(null);

    try {
      const result = await downloadPhotosAsZip(target, zipName, {
        onProgress: (done, total) => setDownloading({ done, total }),
        signal: controller.signal,
      });

      if (result.failed.length > 0) {
        setFeedbackMsg({
          type: "error",
          text: `${result.failed.length} of ${target.length} photos could not be downloaded.`,
        });
      } else {
        setFeedbackMsg({
          type: "success",
          text: `Downloaded ${target.length} photos as ZIP archive.`,
        });
      }
    } catch (err: any) {
      if (err.message !== "Download cancelled") {
        setFeedbackMsg({
          type: "error",
          text: err.message || "Failed to download photos archive.",
        });
      }
    } finally {
      setDownloading(null);
      setAbortController(null);
    }
  }

  function handleCancel() {
    abortController?.abort();
    setDownloading(null);
    setAbortController(null);
  }

  function onDownloadAllClick() {
    if (photos.length > 50 && driveFolderId) {
      setDownloadPromptOpen(true);
    } else {
      handleDownload(photos.slice(0, 60), `${eventTitle}.zip`);
    }
  }

  function handleSelectAllFiltered() {
    filteredPhotos.forEach((p) => {
      if (!selectedIds.has(p.id)) {
        toggle(p.id);
      }
    });
  }

  const hasActiveFilters =
    activeTab !== "all" ||
    selectedCamera !== "all" ||
    selectedSubfolder !== "all" ||
    Boolean(searchQuery.trim());

  return (
    <div className="space-y-3 mb-6 sm:mb-8">
      {/* ── UNIFIED MASTER TOOLBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-[#090510]/80 backdrop-blur-xl border border-white/[0.08] shadow-xl">
        
        {/* LEFT SECTION: Filter Categories & Folders */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Segmented Category Tabs (Excludes empty categories strictly) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.07] shrink-0">
            {/* All Photos Tab */}
            <button
              type="button"
              onClick={() => onTabChange?.("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                activeTab === "all"
                  ? "bg-[#9D5EE5]/30 text-white font-semibold shadow-sm"
                  : "text-white/50 hover:text-white"
              )}
            >
              All <span className="opacity-60 text-[10px] ml-0.5 font-mono">({photos.length})</span>
            </button>

            {/* Group Photos Tab — ONLY if > 0 */}
            {groupPhotosCount > 0 && (
              <button
                type="button"
                onClick={() => onTabChange?.("group")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "group"
                    ? "bg-[#9D5EE5]/30 text-white font-semibold shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Users size={12} className="text-[#C084FC]" />
                <span>Group</span>
                <span className="opacity-60 text-[10px] font-mono">({groupPhotosCount})</span>
              </button>
            )}

            {/* VIP / Chief Guest Tab — ONLY if > 0 */}
            {chiefGuestCount > 0 && (
              <button
                type="button"
                onClick={() => onTabChange?.("chief")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "chief"
                    ? "bg-[#9D5EE5]/30 text-white font-semibold shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Crown size={12} className="text-amber-300" />
                <span>VIP</span>
                <span className="opacity-60 text-[10px] font-mono">({chiefGuestCount})</span>
              </button>
            )}

            {/* Saved / Favorites Tab */}
            {favoriteIds.length > 0 && (
              <button
                type="button"
                onClick={() => onTabChange?.("favorites")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === "favorites"
                    ? "bg-red-500/25 text-red-200 font-semibold shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Heart
                  size={12}
                  className={activeTab === "favorites" ? "fill-red-400 text-red-400" : "text-white/40"}
                />
                <span>Saved</span>
                <span className="opacity-60 text-[10px] font-mono">({favoriteIds.length})</span>
              </button>
            )}
          </div>

          {/* Subfolders Dropdown Menu (If subfolders exist) */}
          {visibleSubfolders.length > 0 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFolderMenu((v) => !v)}
                className={cn(
                  "h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                  selectedSubfolder !== "all"
                    ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <Folder size={12} className={selectedSubfolder !== "all" ? "text-[#C084FC]" : "text-white/50"} />
                <span className="truncate max-w-[130px] font-sans font-medium">
                  {selectedSubfolder === "all" ? "Folders" : selectedSubfolder}
                </span>
                <ChevronDown
                  size={11}
                  className={cn("text-white/40 transition-transform duration-200", showFolderMenu && "rotate-180")}
                />
              </button>

              {/* Subfolders Dropdown Popover */}
              <AnimatePresence>
                {showFolderMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowFolderMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-[calc(100%+6px)] min-w-[220px] max-h-[280px] overflow-y-auto rounded-2xl bg-[#0e071a]/95 backdrop-blur-2xl border border-purple-500/30 p-1.5 shadow-2xl z-50 divide-y divide-white/[0.04]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubfolder?.("all");
                          setShowFolderMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer",
                          selectedSubfolder === "all"
                            ? "bg-[#9D5EE5]/25 text-white font-bold"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span className="font-sans font-medium">All Folders</span>
                        <span className="text-[10px] opacity-60">({photos.length})</span>
                      </button>

                      {visibleSubfolders.map((f) => (
                        <button
                          key={f.fullPath}
                          type="button"
                          onClick={() => {
                            onSelectSubfolder?.(f.fullPath);
                            setShowFolderMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer",
                            selectedSubfolder === f.fullPath
                              ? "bg-[#9D5EE5]/25 text-white font-bold"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="font-sans truncate mr-2 font-medium">{f.name}</span>
                          <span className="text-[10px] opacity-60 shrink-0">({f.count})</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT SECTION: Search, Hardware Filters, Layout & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
          {/* Compact Integrated Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search frames…"
              className="h-8 w-full sm:w-36 focus:sm:w-52 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-8 pr-7 text-xs text-white placeholder:text-white/35 focus:border-[#C084FC]/60 focus:bg-white/[0.07] focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Camera Filter Popover Button (Only if cameras available) */}
          {availableCameras && availableCameras.length > 0 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowCameraMenu((v) => !v)}
                className={cn(
                  "h-8 px-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                  selectedCamera !== "all"
                    ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]"
                )}
                title="Filter by camera hardware"
              >
                <SlidersHorizontal size={12} className="text-[#C084FC]" />
                <span className="hidden md:inline font-mono text-[11px]">Camera</span>
                {selectedCamera !== "all" && <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />}
              </button>

              <AnimatePresence>
                {showCameraMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCameraMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+6px)] min-w-[200px] p-2 rounded-2xl bg-[#0e071a]/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl z-50 space-y-1"
                    >
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 px-2 py-1">
                        Camera Hardware
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onCameraChange?.("all");
                          setShowCameraMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer",
                          selectedCamera === "all"
                            ? "bg-[#9D5EE5]/30 text-white font-bold"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        All Cameras
                      </button>
                      {availableCameras.map((cam) => (
                        <button
                          key={cam}
                          type="button"
                          onClick={() => {
                            onCameraChange?.(cam);
                            setShowCameraMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all truncate cursor-pointer",
                            selectedCamera === cam
                              ? "bg-[#9D5EE5]/30 text-white font-bold"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {cam}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Layout Switcher (Masonry vs Uniform Grid) */}
          <div className="hidden sm:inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
            <button
              type="button"
              onClick={() => onLayoutChange?.("masonry")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                layoutMode === "masonry" ? "bg-[#9D5EE5]/30 text-white shadow-sm" : "text-white/40 hover:text-white"
              )}
              title="Masonry Feed"
            >
              <Columns size={13} />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange?.("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                layoutMode === "grid" ? "bg-[#9D5EE5]/30 text-white shadow-sm" : "text-white/40 hover:text-white"
              )}
              title="Uniform Grid"
            >
              <LayoutGrid size={13} />
            </button>
          </div>

          {/* Select Mode Toggle */}
          <button
            type="button"
            onClick={onToggleSelectMode}
            className={cn(
              "h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm",
              selectMode
                ? "bg-[#9D5EE5] border-[#C084FC] text-white"
                : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
            )}
            title="Select photos to batch download"
          >
            <CheckSquare size={12} className={selectMode ? "text-white" : "text-[#C084FC]"} />
            <span className="hidden sm:inline">Select</span>
          </button>

          {/* Share Action */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="h-8 px-2.5 sm:px-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            title="Share gallery"
          >
            <Share2 size={12} className="text-[#C084FC]" />
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Download Action */}
          <button
            type="button"
            onClick={onDownloadAllClick}
            className="h-8 px-3 sm:px-3.5 rounded-xl border border-[#9D5EE5]/40 bg-[#9D5EE5]/20 hover:bg-[#9D5EE5]/35 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            title="Download photos"
          >
            <Download size={12} className="text-[#C084FC]" />
            <span>Download</span>
          </button>

          {/* Admin Sync Action (strictly admin-only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8 w-8 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Sync photos from Google Drive"
            >
              <RefreshCw size={12} className={cn("text-[#C084FC]", isSyncing && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {/* ── REFINED STATUS & ACTIVE FILTER BADGES STRIP ── */}
      <div className="flex items-center justify-between text-xs text-white/50 font-mono px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/80 font-medium">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? "photograph" : "photographs"}
          </span>

          {hasActiveFilters && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/40">Filtered by:</span>

              {selectedSubfolder !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#9D5EE5]/15 border border-[#9D5EE5]/30 text-[#C084FC] text-[11px]">
                  <span>Folder: {selectedSubfolder}</span>
                  <button
                    type="button"
                    onClick={() => onSelectSubfolder?.("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCamera !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#9D5EE5]/15 border border-[#9D5EE5]/30 text-[#C084FC] text-[11px]">
                  <span>{selectedCamera}</span>
                  <button
                    type="button"
                    onClick={() => onCameraChange?.("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/80 text-[11px]">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => onSearchChange?.("")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={onResetFilters}
                className="text-[11px] text-[#C084FC] hover:text-white hover:underline transition-all cursor-pointer font-sans font-semibold ml-1"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Feedback or Download progress */}
        {feedbackMsg && (
          <span
            className={cn(
              "text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border font-sans font-medium shrink-0 shadow-sm",
              feedbackMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            )}
          >
            {feedbackMsg.text}
          </span>
        )}

        {downloading && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/[0.08] px-2.5 py-0.5 text-[11px] shrink-0 font-mono">
            <Loader2 className="h-3 w-3 animate-spin text-[#C084FC]" />
            <span className="text-white/80">
              {Math.round((downloading.done / downloading.total) * 100)}%
            </span>
            <button
              type="button"
              className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors ml-1 cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── STICKY FLOATING SELECTION CONTROL BAR ── */}
      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#090510]/95 backdrop-blur-2xl border border-[#9D5EE5]/40 shadow-[0_12px_45px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#C084FC] animate-pulse" />
                <span>
                  {selectedIds.size} of {filteredPhotos.length} selected
                </span>
              </div>

              <div className="h-4 w-px bg-white/15" />

              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === filteredPhotos.length) {
                    clear();
                  } else {
                    handleSelectAllFiltered();
                  }
                }}
                className="text-xs font-mono text-[#C084FC] hover:text-white transition-colors cursor-pointer"
              >
                {selectedIds.size === filteredPhotos.length ? "Deselect All" : "Select All"}
              </button>

              <div className="h-4 w-px bg-white/15" />

              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => handleDownload(selectedPhotos, `${eventTitle}-selected.zip`)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md",
                  selectedIds.size > 0
                    ? "bg-[#9D5EE5] hover:bg-[#8B44DD] text-white border border-purple-400/50 shadow-purple-950/50"
                    : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                )}
              >
                <Download size={12} />
                <span>Download ({selectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clear();
                  onToggleSelectMode();
                }}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Exit selection mode"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOWNLOAD PROMPT MODAL FOR LARGE ALBUMS ── */}
      <AnimatePresence>
        {downloadPromptOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl glass-card border border-purple-500/30 p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Download className="text-[#C084FC]" size={18} />
                  Download Archive
                </h3>
                <button
                  type="button"
                  onClick={() => setDownloadPromptOpen(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                This event contains <strong className="text-white">{photos.length} photographs</strong>. Choose how you would like to download:
              </p>

              <div className="space-y-2 pt-2">
                {driveFolderId && (
                  <a
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setDownloadPromptOpen(false)}
                    className="w-full p-3.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-white font-bold text-xs flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-semibold">Download All from Google Drive</p>
                      <p className="text-[10px] text-purple-300/70 font-normal">Original high-res batch download (recommended)</p>
                    </div>
                    <ExternalLink size={15} className="text-[#C084FC] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setDownloadPromptOpen(false);
                    handleDownload(photos.slice(0, 50), `${eventTitle}-batch1.zip`);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all text-left cursor-pointer"
                >
                  <div>
                    <p className="text-white font-semibold">Download First 50 as ZIP</p>
                    <p className="text-[10px] text-white/40 font-normal">Direct browser ZIP bundle</p>
                  </div>
                  <Download size={15} className="text-white/50" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      {shareOpen && (
        <ShareDialog
          url={typeof window !== "undefined" ? window.location.href : ""}
          title={eventTitle}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
