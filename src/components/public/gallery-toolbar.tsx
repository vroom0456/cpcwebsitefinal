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
  Folder,
  Columns,
  LayoutGrid,
  Users,
  Crown,
  Heart,
  ChevronDown,
  SlidersHorizontal,
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
        setFeedbackMsg({ type: "error", text: `${result.failed.length} of ${target.length} photos failed.` });
      } else {
        setFeedbackMsg({ type: "success", text: `Downloaded ${target.length} photos.` });
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
      {/* ── TOOLBAR ROW ── */}
      <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
        {/* LEFT: Category tabs + folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
          {/* Segmented tabs */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.07] shrink-0">
            <TabButton active={activeTab === "all"} onClick={() => onTabChange?.("all")}>
              All <span className="opacity-60 text-[10px] ml-0.5 font-mono">({photos.length})</span>
            </TabButton>
            {groupPhotosCount > 0 && (
              <TabButton active={activeTab === "group"} onClick={() => onTabChange?.("group")} icon={<Users size={13} />}>
                Group <span className="opacity-60 text-[10px] font-mono">({groupPhotosCount})</span>
              </TabButton>
            )}
            {chiefGuestCount > 0 && (
              <TabButton active={activeTab === "chief"} onClick={() => onTabChange?.("chief")} icon={<Crown size={13} className={activeTab === "chief" ? "text-purple-300" : "text-white/60"} />}>
                VIP <span className="opacity-60 text-[10px] font-mono">({chiefGuestCount})</span>
              </TabButton>
            )}
            {favoriteIds.length > 0 && (
              <TabButton
                active={activeTab === "favorites"}
                onClick={() => onTabChange?.("favorites")}
                icon={<Heart size={13} className={activeTab === "favorites" ? "fill-red-400 text-red-400" : "text-white/50"} />}
                activeClass="bg-red-500/25 text-red-200"
              >
                Saved <span className="opacity-60 text-[10px] font-mono">({favoriteIds.length})</span>
              </TabButton>
            )}
          </div>

          {/* Subfolder dropdown */}
          {visibleSubfolders.length > 0 && (
            <DropdownMenu
              open={showFolderMenu}
              onToggle={() => setShowFolderMenu((v) => !v)}
              onClose={() => setShowFolderMenu(false)}
              active={selectedSubfolder !== "all"}
              label={selectedSubfolder === "all" ? "Folders" : selectedSubfolder}
              icon={<Folder size={14} />}
            >
              <DropdownItem
                active={selectedSubfolder === "all"}
                onClick={() => { onSelectSubfolder?.("all"); setShowFolderMenu(false); }}
              >
                <span className="font-sans font-medium">All Folders</span>
                <span className="text-[10px] opacity-60">({photos.length})</span>
              </DropdownItem>
              {visibleSubfolders.map((f) => (
                <DropdownItem
                  key={f.fullPath}
                  active={selectedSubfolder === f.fullPath}
                  onClick={() => { onSelectSubfolder?.(f.fullPath); setShowFolderMenu(false); }}
                >
                  <span className="font-sans truncate mr-2 font-medium">{f.name}</span>
                  <span className="text-[10px] opacity-60 shrink-0">({f.count})</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </div>

        {/* RIGHT: Search, layout, camera, select, share, download */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search photos…"
              className="h-10 sm:h-10.5 w-10 focus:w-36 sm:w-32 sm:focus:w-48 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-9 pr-2.5 focus:pr-8 text-xs text-white placeholder:text-white/35 focus:border-[#C084FC]/60 focus:bg-white/[0.07] focus:outline-none transition-all duration-300 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Layout switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
            <IconButton
              active={layoutMode === "masonry"}
              onClick={() => onLayoutChange?.("masonry")}
              title="Masonry Feed"
            >
              <Columns size={15} />
            </IconButton>
            <IconButton
              active={layoutMode === "grid"}
              onClick={() => onLayoutChange?.("grid")}
              title="Uniform Grid"
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
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 px-2 py-1">Camera</p>
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

          {/* Select + Share + Download */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleSelectMode}
              className={cn(
                "h-10 w-10 sm:h-10.5 sm:w-10.5 rounded-xl border text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95",
                selectMode
                  ? "bg-white border-white text-black font-bold"
                  : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]"
              )}
              title="Select multiple photos"
              aria-label="Select photos"
            >
              <CheckSquare size={15} />
            </button>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="h-10 w-10 sm:h-10.5 sm:w-10.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              title="Share event gallery"
              aria-label="Share event"
            >
              <Share2 size={15} />
            </button>

            <button
              type="button"
              onClick={onDownloadAllClick}
              className="h-10 sm:h-10.5 px-3.5 sm:px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Download photos"
            >
              <Download size={15} />
              <span className="hidden sm:inline font-medium">Download</span>
            </button>
          </div>

          {/* Admin sync */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-10 w-10 sm:h-10.5 sm:w-10.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Sync from Google Drive"
            >
              <RefreshCw size={14} className={cn("text-[#C084FC]", isSyncing && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {/* ── STATUS BAR (Only shown when active filters or search refine the view, avoiding 3x count redundancy) ── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-white/60 font-mono px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#C084FC] font-semibold">
              Showing {filteredPhotos.length} of {photos.length} photos
            </span>
            {selectedSubfolder !== "all" && (
              <FilterBadge onClear={() => onSelectSubfolder?.("all")}>Folder: {selectedSubfolder}</FilterBadge>
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
              className="text-[11px] text-[#C084FC] hover:text-white hover:underline transition-all cursor-pointer font-sans font-semibold ml-1"
            >
              Reset
            </button>
          </div>

          {/* Feedback / download progress */}
          {feedbackMsg && (
            <span className={cn(
              "text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border font-sans font-medium shrink-0 shadow-sm",
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
              <button type="button" className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors ml-1 cursor-pointer" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      {/* ── SELECTION BAR (floating) ── */}
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
                <span>{selectedIds.size} of {filteredPhotos.length} selected</span>
              </div>
              <div className="h-4 w-px bg-white/15" />
              <button
                type="button"
                onClick={() => { selectedIds.size === filteredPhotos.length ? clear() : handleSelectAllFiltered(); }}
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
                    ? "bg-white hover:bg-white/90 text-black border border-white/80"
                    : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                )}
              >
                <Download size={12} />
                <span>Download ({selectedIds.size})</span>
              </button>
              <button
                type="button"
                onClick={() => { clear(); onToggleSelectMode(); }}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Exit selection mode"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOWNLOAD PROMPT (large albums) ── */}
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
                <button type="button" onClick={() => setDownloadPromptOpen(false)} className="p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                This event contains <strong className="text-white">{photos.length} photographs</strong>. Choose how to download:
              </p>
              <div className="space-y-2 pt-2">
                {driveFolderId && (
                  <a
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setDownloadPromptOpen(false)}
                    className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-between transition-all group cursor-pointer"
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
                  onClick={() => { setDownloadPromptOpen(false); handleDownload(photos.slice(0, 50), `${eventTitle}-batch1.zip`); }}
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

/* ────────────────────────────────────────────────
   Extracted sub-components for cleaner JSX
   ──────────────────────────────────────────────── */

function TabButton({
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
        "h-9 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-xs",
        active
          ? activeClass || "bg-white text-black font-semibold shadow-sm"
          : "text-white/60 hover:text-white"
      )}
    >
      {icon}
      {children}
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
        active ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white"
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
          "h-10 sm:h-10.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer relative shadow-sm",
          iconOnly ? "w-10 sm:w-10.5 justify-center" : "px-3 sm:px-3.5",
          active
            ? "bg-white/15 border-white/40 text-white shadow-sm"
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
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
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
                "absolute top-[calc(100%+6px)] min-w-[200px] max-h-[320px] overflow-y-auto rounded-2xl bg-[#0e071a]/95 backdrop-blur-2xl border border-purple-500/30 p-1.5 shadow-2xl z-[120] space-y-0.5",
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
        active ? "bg-white/20 text-white font-bold" : "text-white/70 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}

function FilterBadge({ onClear, children }: { onClear: () => void; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[11px]">
      <span>{children}</span>
      <button type="button" onClick={onClear} className="hover:text-white/60 cursor-pointer ml-0.5">×</button>
    </span>
  );
}
