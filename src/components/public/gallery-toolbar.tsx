"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  CheckSquare,
  Loader2,
  X,
  RefreshCw,
  Search,
  Folder,
  Columns,
  LayoutGrid,
  Users,
  Crown,
  Heart,
  ChevronDown,
  SlidersHorizontal,
  ExternalLink,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { useSelectionStore } from "@/store/selection-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadPhotosAsZip, downloadSinglePhoto, isMobileDevice, DownloadVariant } from "@/lib/utils/download";
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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloading, setDownloading] = useState<{ done: number; total: number } | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [downloadPromptOpen, setDownloadPromptOpen] = useState(false);

  // Mobile specific state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);
  const [mobileMoreSheetOpen, setMobileMoreSheetOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

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
          text: `Synced! ${data.eventsDiscovered} events discovered.`,
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Sync request failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDownload(target: Photo[], zipName: string, variant: DownloadVariant = "cpc") {
    if (target.length === 0) return;
    const controller = new AbortController();
    setAbortController(controller);
    setDownloading({ done: 0, total: target.length });
    setFeedbackMsg(null);

    try {
      const result = await downloadPhotosAsZip(target, zipName, {
        variant,
        onProgress: (done, total) => setDownloading({ done, total }),
        signal: controller.signal,
      });
      if (result.failed.length > 0) {
        setFeedbackMsg({ type: "error", text: `${result.failed.length} of ${target.length} photos failed.` });
      } else {
        setFeedbackMsg({ type: "success", text: `Downloaded ${target.length} photographs.` });
      }
    } catch (err: any) {
      if (err.message !== "Download cancelled") {
        setFeedbackMsg({ type: "error", text: err.message || "Download failed." });
      }
    } finally {
      setDownloading(null);
      setAbortController(null);
    }
  }

  function handleCancelDownload() {
    abortController?.abort();
    setDownloading(null);
    setAbortController(null);
  }

  function onDownloadAllClick(variant: DownloadVariant = "cpc") {
    setShowDownloadMenu(false);
    setMobileMoreSheetOpen(false);
    if (photos.length > 60 && driveFolderId) {
      setDownloadPromptOpen(true);
    } else {
      handleDownload(photos.slice(0, 60), `${eventTitle}.zip`, variant);
    }
  }

  function handleSelectAllFiltered() {
    filteredPhotos.forEach((p) => {
      if (!selectedIds.has(p.id)) toggle(p.id);
    });
  }

  const hasActiveFilters =
    activeTab !== "all" ||
    selectedCamera !== "all" ||
    selectedSubfolder !== "all" ||
    Boolean(searchQuery.trim());

  return (
    <div className="space-y-3 mb-6 sm:mb-8 relative z-30">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP GALLERY TOOLBAR (hidden on mobile, visible md+)
          3-Zone balanced layout: [Navigation] | [Search] | [Actions]
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#0A0612]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
        {/* ZONE 1 (Left): Compact, subtle navigation tabs (NO photo counts) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <NavTabButton
              active={activeTab === "all"}
              onClick={() => onTabChange?.("all")}
            >
              All
            </NavTabButton>

            {groupPhotosCount > 0 && (
              <NavTabButton
                active={activeTab === "group"}
                onClick={() => onTabChange?.("group")}
                icon={<Users size={13} />}
              >
                Group
              </NavTabButton>
            )}

            {chiefGuestCount > 0 && (
              <NavTabButton
                active={activeTab === "chief"}
                onClick={() => onTabChange?.("chief")}
                icon={<Crown size={13} className={activeTab === "chief" ? "text-purple-300" : "text-white/60"} />}
              >
                VIP
              </NavTabButton>
            )}

            {favoriteIds.length > 0 && (
              <NavTabButton
                active={activeTab === "favorites"}
                onClick={() => onTabChange?.("favorites")}
                icon={<Heart size={13} className={activeTab === "favorites" ? "fill-red-400 text-red-400" : "text-white/60"} />}
                activeClass="bg-red-500/20 text-red-200 border-red-500/30"
              >
                Saved
              </NavTabButton>
            )}
          </div>

          {/* Subfolder dropdown — shown only when folders actually exist */}
          {visibleSubfolders.length > 0 && (
            <DropdownMenu
              open={showFolderMenu}
              onToggle={() => setShowFolderMenu((v) => !v)}
              onClose={() => setShowFolderMenu(false)}
              active={selectedSubfolder !== "all"}
              label={selectedSubfolder === "all" ? "Folders" : selectedSubfolder}
              icon={<Folder size={14} className="text-[#C084FC]" />}
            >
              <DropdownItem
                active={selectedSubfolder === "all"}
                onClick={() => { onSelectSubfolder?.("all"); setShowFolderMenu(false); }}
              >
                All Folders
              </DropdownItem>
              {visibleSubfolders.map((f) => (
                <DropdownItem
                  key={f.fullPath}
                  active={selectedSubfolder === f.fullPath}
                  onClick={() => { onSelectSubfolder?.(f.fullPath); setShowFolderMenu(false); }}
                >
                  <span className="truncate">{f.name}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </div>

        {/* ZONE 2 (Center): Clean, aligned search field (~220–280px) */}
        <div className="relative flex-1 max-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onSearchChange?.("");
            }}
            placeholder="Search event photos..."
            className="h-10 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-9 pr-8 text-xs text-white placeholder:text-white/35 focus:border-[#C084FC]/60 focus:bg-white/[0.07] focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ZONE 3 (Right): Standardized 40px action controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Layout switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <IconButton
              active={layoutMode === "masonry"}
              onClick={() => onLayoutChange?.("masonry")}
              title="Masonry Layout"
            >
              <Columns size={15} />
            </IconButton>
            <IconButton
              active={layoutMode === "grid"}
              onClick={() => onLayoutChange?.("grid")}
              title="Grid Layout"
            >
              <LayoutGrid size={15} />
            </IconButton>
          </div>

          {/* Camera filter */}
          {availableCameras.length > 0 && (
            <DropdownMenu
              open={showCameraMenu}
              onToggle={() => setShowCameraMenu((v) => !v)}
              onClose={() => setShowCameraMenu(false)}
              active={selectedCamera !== "all"}
              iconOnly
              icon={<SlidersHorizontal size={14} />}
              align="right"
            >
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 px-3 py-1">Camera Gear</p>
              <DropdownItem
                active={selectedCamera === "all"}
                onClick={() => { onCameraChange?.("all"); setShowCameraMenu(false); }}
              >
                All Cameras
              </DropdownItem>
              {availableCameras.map((cam) => (
                <DropdownItem
                  key={cam}
                  active={selectedCamera === cam}
                  onClick={() => { onCameraChange?.(cam); setShowCameraMenu(false); }}
                >
                  {cam}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}

          {/* Multi-select toggle */}
          <button
            type="button"
            onClick={onToggleSelectMode}
            className={cn(
              "h-10 px-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95",
              selectMode
                ? "bg-purple-950/70 border-purple-500/40 text-purple-200"
                : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]"
            )}
            title="Toggle selection mode"
          >
            <CheckSquare size={14} className={selectMode ? "text-[#C084FC]" : "text-white/60"} />
            <span className="hidden lg:inline">Select</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
            title="Share event gallery"
            aria-label="Share event"
          >
            <Share2 size={15} />
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu((v) => !v)}
              className="h-10 px-3.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Download options"
            >
              <Download size={14} className="text-[#C084FC]" />
              <span>Download</span>
              <ChevronDown size={12} className={cn("text-white/50 transition-transform", showDownloadMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showDownloadMenu && (
                <>
                  <div className="fixed inset-0 z-[110]" onClick={() => setShowDownloadMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute right-0 top-[calc(100%+6px)] w-60 rounded-2xl bg-[#0A0510]/95 backdrop-blur-2xl border border-purple-500/30 p-2 shadow-2xl z-[120] space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() => onDownloadAllClick("cpc")}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors text-xs cursor-pointer group"
                    >
                      <p className="font-semibold text-white flex items-center gap-2">
                        <span>Download with CPC Credit</span>
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5">Embedded metadata attribution</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadAllClick("original")}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors text-xs cursor-pointer group"
                    >
                      <p className="font-semibold text-white/80 group-hover:text-white">Download Original (Raw)</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Pristine unchanged file stream</p>
                    </button>
                    {driveFolderId && (
                      <a
                        href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowDownloadMenu(false)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors text-xs flex items-center justify-between text-white/70 hover:text-white"
                      >
                        <div>
                          <p className="font-semibold">Google Drive Folder</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Open full original cloud folder</p>
                        </div>
                        <ExternalLink size={13} className="text-white/40" />
                      </a>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Admin sync */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Sync from Google Drive"
            >
              <RefreshCw size={14} className={cn("text-[#C084FC]", isSyncing && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE GALLERY TOOLBAR (visible on mobile < md)
          Lightweight, single row: [Tabs/Albums] | [Search] | [Filters] | [More]
          Expands smoothly on search without layout jumps
          ───────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#0A0612]/90 backdrop-blur-2xl border border-white/[0.08] shadow-xl">
        {mobileSearchOpen ? (
          /* Full-width expanded mobile search row */
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 w-full"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search gallery..."
                className="h-10 w-full rounded-xl bg-white/[0.05] border border-white/[0.1] pl-9 pr-8 text-xs text-white placeholder:text-white/40 focus:border-[#C084FC]/60 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 p-1"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                onSearchChange?.("");
              }}
              className="px-2.5 py-2 text-xs font-medium text-white/70 hover:text-white shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          /* Default compact mobile row: [All / Album] | [Search] | [Filters] | [More] */
          <>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <NavTabButton
                active={activeTab === "all" && selectedSubfolder === "all"}
                onClick={() => {
                  onTabChange?.("all");
                  onSelectSubfolder?.("all");
                }}
              >
                All
              </NavTabButton>

              {groupPhotosCount > 0 && (
                <NavTabButton
                  active={activeTab === "group"}
                  onClick={() => onTabChange?.("group")}
                  icon={<Users size={12} />}
                >
                  Group
                </NavTabButton>
              )}

              {chiefGuestCount > 0 && (
                <NavTabButton
                  active={activeTab === "chief"}
                  onClick={() => onTabChange?.("chief")}
                  icon={<Crown size={12} className={activeTab === "chief" ? "text-purple-300" : "text-white/60"} />}
                >
                  VIP
                </NavTabButton>
              )}

              {visibleSubfolders.length > 0 && selectedSubfolder !== "all" && (
                <span className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-[11px] font-medium text-white truncate max-w-[100px]">
                  {selectedSubfolder}
                </span>
              )}
            </div>

            {/* Right mobile icons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
                title="Search"
                aria-label="Search"
              >
                <Search size={14} className={searchQuery ? "text-[#C084FC]" : undefined} />
              </button>

              {/* Filters bottom sheet trigger */}
              <button
                type="button"
                onClick={() => setMobileFilterSheetOpen(true)}
                className={cn(
                  "h-9 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer active:scale-95",
                  (selectedCamera !== "all" || selectedSubfolder !== "all")
                    ? "bg-purple-950/60 border-purple-500/40 text-purple-200"
                    : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white"
                )}
                title="Filter options"
              >
                <SlidersHorizontal size={13} />
                <span className="text-[11px]">Filters</span>
              </button>

              {/* More menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMoreSheetOpen(true)}
                className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
                title="More actions"
                aria-label="More actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE FILTERS NOTIFICATION (Minimal status pill)
          ───────────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-white/60 px-1 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#C084FC]">
              Filtered ({filteredPhotos.length} photos)
            </span>
            {selectedSubfolder !== "all" && (
              <FilterBadge onClear={() => onSelectSubfolder?.("all")}>{selectedSubfolder}</FilterBadge>
            )}
            {selectedCamera !== "all" && (
              <FilterBadge onClear={() => onCameraChange?.("all")}>{selectedCamera}</FilterBadge>
            )}
            {searchQuery && (
              <FilterBadge onClear={() => onSearchChange?.("")}>&ldquo;{searchQuery}&rdquo;</FilterBadge>
            )}
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-[#C084FC] hover:text-white underline cursor-pointer ml-1 font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Feedback message */}
          {feedbackMsg && (
            <span className={cn(
              "text-[10px] px-2.5 py-0.5 rounded-full border font-medium shrink-0",
              feedbackMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            )}>
              {feedbackMsg.text}
            </span>
          )}

          {downloading && (
            <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/[0.08] px-2.5 py-0.5 text-[11px] shrink-0 font-mono">
              <Loader2 className="h-3 w-3 animate-spin text-[#C084FC]" />
              <span className="text-white/80">{Math.round((downloading.done / downloading.total) * 100)}%</span>
              <button
                type="button"
                className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                onClick={handleCancelDownload}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FLOATING CONTEXTUAL SELECTION BAR (Mobile & Desktop)
          Respects mobile safe area inset; clear, focused actions.
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
          >
            <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#090510]/95 backdrop-blur-2xl border border-purple-500/40 shadow-[0_12px_45px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#C084FC] animate-pulse" />
                <span>{selectedIds.size} selected</span>
              </div>
              <div className="h-4 w-px bg-white/15" />
              <button
                type="button"
                onClick={() => { selectedIds.size === filteredPhotos.length ? clear() : handleSelectAllFiltered(); }}
                className="text-xs font-mono text-[#C084FC] hover:text-white transition-colors cursor-pointer"
              >
                {selectedIds.size === filteredPhotos.length ? "Deselect" : "Select All"}
              </button>
              <div className="h-4 w-px bg-white/15" />
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => handleDownload(selectedPhotos, `${eventTitle}-selected.zip`, "cpc")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md",
                  selectedIds.size > 0
                    ? "bg-white hover:bg-white/90 text-black border border-white/80 active:scale-95"
                    : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                )}
              >
                <Download size={13} />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => { clear(); onToggleSelectMode(); }}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Cancel selection"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          5. MOBILE FILTERS BOTTOM SHEET
          Accessible bottom sheet with backdrop
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              onClick={() => setMobileFilterSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#0C0616] border-t border-purple-500/30 p-5 space-y-5 shadow-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Sheet grab handle & header */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-1 rounded-full bg-white/20" />
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white font-display">
                    Filter Gallery
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterSheetOpen(false)}
                    className="p-1.5 rounded-full text-white/60 hover:text-white bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* View Categories */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { onTabChange?.("all"); setMobileFilterSheetOpen(false); }}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-medium text-left border transition-all",
                      activeTab === "all"
                        ? "bg-purple-950/70 border-purple-500/40 text-white"
                        : "bg-white/[0.04] border-white/10 text-white/60"
                    )}
                  >
                    All Photographs
                  </button>
                  {groupPhotosCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { onTabChange?.("group"); setMobileFilterSheetOpen(false); }}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center gap-1.5",
                        activeTab === "group"
                          ? "bg-purple-950/70 border-purple-500/40 text-white"
                          : "bg-white/[0.04] border-white/10 text-white/60"
                      )}
                    >
                      <Users size={13} />
                      <span>Group Photos</span>
                    </button>
                  )}
                  {chiefGuestCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { onTabChange?.("chief"); setMobileFilterSheetOpen(false); }}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center gap-1.5",
                        activeTab === "chief"
                          ? "bg-purple-950/70 border-purple-500/40 text-white"
                          : "bg-white/[0.04] border-white/10 text-white/60"
                      )}
                    >
                      <Crown size={13} className="text-[#C084FC]" />
                      <span>VIP / Guests</span>
                    </button>
                  )}
                  {favoriteIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { onTabChange?.("favorites"); setMobileFilterSheetOpen(false); }}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center gap-1.5",
                        activeTab === "favorites"
                          ? "bg-red-950/50 border-red-500/40 text-red-200"
                          : "bg-white/[0.04] border-white/10 text-white/60"
                      )}
                    >
                      <Heart size={13} className="fill-red-400 text-red-400" />
                      <span>Saved Favorites</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Folders (if any) */}
              {visibleSubfolders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Albums & Folders</p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => { onSelectSubfolder?.("all"); setMobileFilterSheetOpen(false); }}
                      className={cn(
                        "w-full p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between",
                        selectedSubfolder === "all"
                          ? "bg-purple-950/70 border-purple-500/40 text-white"
                          : "bg-white/[0.04] border-white/10 text-white/60"
                      )}
                    >
                      <span>All Folders</span>
                      {selectedSubfolder === "all" && <Check size={14} className="text-[#C084FC]" />}
                    </button>
                    {visibleSubfolders.map((f) => (
                      <button
                        key={f.fullPath}
                        type="button"
                        onClick={() => { onSelectSubfolder?.(f.fullPath); setMobileFilterSheetOpen(false); }}
                        className={cn(
                          "w-full p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between",
                          selectedSubfolder === f.fullPath
                            ? "bg-purple-950/70 border-purple-500/40 text-white"
                            : "bg-white/[0.04] border-white/10 text-white/60"
                        )}
                      >
                        <span className="truncate">{f.name}</span>
                        {selectedSubfolder === f.fullPath && <Check size={14} className="text-[#C084FC]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Camera Gear (if available) */}
              {availableCameras.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Camera Gear</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { onCameraChange?.("all"); setMobileFilterSheetOpen(false); }}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-medium text-left border transition-all",
                        selectedCamera === "all"
                          ? "bg-purple-950/70 border-purple-500/40 text-white"
                          : "bg-white/[0.04] border-white/10 text-white/60"
                      )}
                    >
                      All Cameras
                    </button>
                    {availableCameras.map((cam) => (
                      <button
                        key={cam}
                        type="button"
                        onClick={() => { onCameraChange?.(cam); setMobileFilterSheetOpen(false); }}
                        className={cn(
                          "p-2.5 rounded-xl text-xs font-medium text-left border transition-all truncate",
                          selectedCamera === cam
                            ? "bg-purple-950/70 border-purple-500/40 text-white"
                            : "bg-white/[0.04] border-white/10 text-white/60"
                        )}
                      >
                        {cam}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout selector */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Feed Layout</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { onLayoutChange?.("masonry"); setMobileFilterSheetOpen(false); }}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2",
                      layoutMode === "masonry"
                        ? "bg-purple-950/70 border-purple-500/40 text-white"
                        : "bg-white/[0.04] border-white/10 text-white/60"
                    )}
                  >
                    <Columns size={14} />
                    <span>Masonry Feed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onLayoutChange?.("grid"); setMobileFilterSheetOpen(false); }}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2",
                      layoutMode === "grid"
                        ? "bg-purple-950/70 border-purple-500/40 text-white"
                        : "bg-white/[0.04] border-white/10 text-white/60"
                    )}
                  >
                    <LayoutGrid size={14} />
                    <span>Uniform Grid</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          6. MOBILE MORE ACTIONS BOTTOM SHEET
          Download All, Select Photos, Share, Admin Sync
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMoreSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              onClick={() => setMobileMoreSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-[#0C0616] border-t border-purple-500/30 p-5 space-y-4 shadow-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-1 rounded-full bg-white/20" />
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white font-display">
                    Gallery Options
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileMoreSheetOpen(false)}
                    className="p-1.5 rounded-full text-white/60 hover:text-white bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {/* Download with credit */}
                <button
                  type="button"
                  onClick={() => onDownloadAllClick("cpc")}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">Download All with CPC Credit</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Lossless embedded club attribution</p>
                  </div>
                  <Download size={15} className="text-[#C084FC]" />
                </button>

                {/* Download Raw */}
                <button
                  type="button"
                  onClick={() => onDownloadAllClick("original")}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white/80">Download Original (Raw Files)</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Pristine unchanged camera files</p>
                  </div>
                  <Download size={15} className="text-white/40" />
                </button>

                {/* Select Photos Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMoreSheetOpen(false);
                    onToggleSelectMode();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">Select Specific Photos</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Choose multiple frames to download</p>
                  </div>
                  <CheckSquare size={15} className="text-[#C084FC]" />
                </button>

                {/* Share Gallery */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMoreSheetOpen(false);
                    setShareOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">Share Gallery Link</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Social QR code & direct link</p>
                  </div>
                  <Share2 size={15} className="text-[#C084FC]" />
                </button>

                {/* Google Drive Link if exists */}
                {driveFolderId && (
                  <a
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMoreSheetOpen(false)}
                    className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">Open in Google Drive</p>
                      <p className="text-[10px] text-white/50 mt-0.5">Original cloud archive folder</p>
                    </div>
                    <ExternalLink size={15} className="text-white/40" />
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          7. LARGE ALBUM DOWNLOAD CONFIRMATION MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {downloadPromptOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[#0E071A] border border-purple-500/30 p-6 space-y-4 shadow-2xl relative"
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
                This event contains a large gallery archive. Choose your preferred download option:
              </p>
              <div className="space-y-2 pt-1">
                {driveFolderId && (
                  <a
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setDownloadPromptOpen(false)}
                    className="w-full p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-white font-bold text-xs flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-semibold">Download All from Google Drive</p>
                      <p className="text-[10px] text-white/60 font-normal">Original high-res batch download (recommended)</p>
                    </div>
                    <ExternalLink size={15} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDownloadPromptOpen(false);
                    handleDownload(photos.slice(0, 50), `${eventTitle}-batch1.zip`, "cpc");
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all text-left cursor-pointer"
                >
                  <div>
                    <p className="text-white font-semibold">Download First 50 as ZIP</p>
                    <p className="text-[10px] text-white/40 font-normal">Direct browser ZIP bundle with CPC attribution</p>
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

/* ────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────── */

function NavTabButton({
  active,
  onClick,
  icon,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  activeClass?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
        active
          ? activeClass || "bg-purple-950/70 border border-purple-500/40 text-white shadow-xs"
          : "text-white/60 hover:text-white hover:bg-white/[0.03] border border-transparent"
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function IconButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-xl transition-all flex items-center justify-center cursor-pointer",
        active
          ? "bg-purple-950/70 border border-purple-500/40 text-white shadow-xs"
          : "text-white/50 hover:text-white hover:bg-white/[0.03]"
      )}
      title={title}
    >
      {children}
    </button>
  );
}

function DropdownMenu({
  open,
  onToggle,
  onClose,
  active,
  label,
  icon,
  iconOnly,
  align = "left",
  children,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  active: boolean;
  label?: string;
  icon: React.ReactNode;
  iconOnly?: boolean;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "h-10 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer relative shadow-sm",
          iconOnly ? "w-10 justify-center" : "px-3.5",
          active
            ? "bg-purple-950/60 border-purple-500/40 text-white"
            : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]"
        )}
      >
        {icon}
        {!iconOnly && (
          <>
            <span className="truncate max-w-[130px] font-sans font-medium">{label}</span>
            <ChevronDown size={12} className={cn("text-white/40 transition-transform duration-200", open && "rotate-180")} />
          </>
        )}
        {iconOnly && active && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[110]" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute top-[calc(100%+6px)] min-w-[200px] max-h-[320px] overflow-y-auto rounded-2xl bg-[#0A0510]/95 backdrop-blur-2xl border border-purple-500/30 p-1.5 shadow-2xl z-[120] space-y-0.5",
                align === "right" ? "right-0" : "left-0"
              )}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer",
        active ? "bg-purple-900/40 border border-purple-500/30 text-white font-bold" : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      {children}
    </button>
  );
}

function FilterBadge({ onClear, children }: { onClear: () => void; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/30 text-white text-[11px]">
      <span>{children}</span>
      <button type="button" onClick={onClear} className="hover:text-white/60 cursor-pointer ml-0.5">×</button>
    </span>
  );
}
