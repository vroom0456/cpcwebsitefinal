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
  Sparkles,
  SlidersHorizontal,
  Camera,
  Users,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useSelectionStore } from "@/store/selection-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadPhotosAsZip } from "@/lib/utils/download";
import { ShareDialog } from "@/components/public/share-dialog";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

export function GalleryToolbar({
  eventTitle,
  photos,
  selectMode,
  onToggleSelectMode,
  favoritesOnly,
  onToggleFavoritesOnly,
  searchQuery = "",
  onSearchChange,
  onOpenAIFaceSearch,
  aiFaceMatchActive = false,
  onToggleFaceSort,
  showFaceSort = false,
  activeTab = "all",
  onTabChange,
  selectedCamera = "all",
  onCameraChange,
  availableCameras = [],
  onResetFilters,
}: {
  eventTitle: string;
  photos: Photo[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  favoritesOnly?: boolean;
  onToggleFavoritesOnly?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenAIFaceSearch?: () => void;
  aiFaceMatchActive?: boolean;
  onToggleFaceSort?: () => void;
  showFaceSort?: boolean;
  activeTab?: "all" | "group" | "chief" | "faces" | "favorites";
  onTabChange?: (tab: "all" | "group" | "chief" | "faces" | "favorites") => void;
  selectedCamera?: string;
  onCameraChange?: (cam: string) => void;
  availableCameras?: string[];
  onResetFilters?: () => void;
}) {
  const { selectedIds, clear } = useSelectionStore();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  const [showFiltersTray, setShowFiltersTray] = useState(false);
  const [downloading, setDownloading] = useState<{ done: number; total: number } | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

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

      if (result && result.failed.length > 0) {
        setFeedbackMsg({ type: "error", text: `Downloaded with ${result.failed.length} failed files.` });
      } else {
        setFeedbackMsg({ type: "success", text: "Download completed!" });
      }
    } catch (err: any) {
      if (err.message === "Download cancelled") {
        setFeedbackMsg({ type: "error", text: "Download was cancelled." });
      } else {
        setFeedbackMsg({ type: "error", text: err instanceof Error ? err.message : "Download failed." });
      }
    } finally {
      setDownloading(null);
      setAbortController(null);
    }
  }

  function handleCancel() {
    if (abortController) abortController.abort();
  }

  const hasActiveAdvancedFilters =
    (selectedCamera && selectedCamera !== "all") ||
    activeTab !== "all" ||
    showFaceSort ||
    aiFaceMatchActive;

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-7">
      {/* ── PRIMARY CONTROLS: [ Search photos... ]  [ Filters ] ── */}
      <div className="flex gap-2.5 sm:gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search photos in archive…"
            className="w-full pl-9 sm:pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-white/35 focus:outline-none focus:border-[#C084FC]/70 focus:bg-white/[0.06] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setShowFiltersTray((s) => !s)}
          className={cn(
            "flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-md",
            showFiltersTray || hasActiveAdvancedFilters
              ? "bg-[#9D5EE5]/25 border-[#C084FC] text-white shadow-purple-950/50"
              : "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C084FC]" />
          <span>Filters</span>
          {hasActiveAdvancedFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
          )}
          <ChevronDown
            className={cn(
              "h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/40 transition-transform duration-200",
              showFiltersTray && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* ── SECONDARY ACTION STRIP: AI FIND | SELECT | SHARE | DOWNLOAD ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* AI Find */}
          <button
            type="button"
            onClick={onOpenAIFaceSearch}
            className={cn(
              "px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0",
              aiFaceMatchActive
                ? "bg-purple-600 text-white border border-purple-400 shadow-purple-900/50 animate-pulse"
                : "bg-purple-600/15 border border-purple-500/30 text-purple-200 hover:text-white hover:border-purple-400 hover:bg-purple-600/25"
            )}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C084FC]" />
            <span>AI FIND</span>
          </button>

          {/* Select Mode */}
          <ToolbarButton
            active={selectMode}
            onClick={() => {
              if (selectMode) clear();
              onToggleSelectMode();
            }}
            icon={selectMode ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            label={selectMode ? `${selectedIds.size} SELECTED` : "SELECT"}
          />

          {/* Share */}
          <ToolbarButton
            onClick={() => setShareOpen(true)}
            icon={<Share2 className="h-3.5 w-3.5" />}
            label="SHARE"
          />

          {/* Download */}
          {selectMode && selectedIds.size > 0 ? (
            <ToolbarButton
              active
              onClick={() => handleDownload(selectedPhotos, `${eventTitle}-selected.zip`)}
              icon={<Download className="h-3.5 w-3.5" />}
              label="DOWNLOAD"
            />
          ) : (
            <ToolbarButton
              onClick={() => handleDownload(photos, `${eventTitle}.zip`)}
              icon={<Download className="h-3.5 w-3.5" />}
              label="DOWNLOAD"
            />
          )}

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-medium transition-all border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 shrink-0 cursor-pointer"
            title="Sync photos from Google Drive vault"
          >
            <RefreshCw size={12} className={cn("text-[#C084FC]", isSyncing && "animate-spin")} />
            <span className="hidden md:inline">{isSyncing ? "SYNCING…" : "SYNC"}</span>
          </button>
        </div>

        {/* Feedback or Download progress */}
        {feedbackMsg && (
          <span
            className={cn(
              "text-[10px] sm:text-[11px] px-3 py-1 rounded-full border font-medium shrink-0 shadow-sm",
              feedbackMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            )}
          >
            {feedbackMsg.text}
          </span>
        )}

        {downloading && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/[0.08] px-3 py-1 text-[11px] shrink-0 font-mono">
            <Loader2 className="h-3 w-3 animate-spin text-[#C084FC]" />
            <span className="text-white/80">
              {Math.round((downloading.done / downloading.total) * 100)}%
            </span>
            <button
              className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors ml-1 cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── ADVANCED FILTERS PANEL (Camera, Category, People, Faces) ── */}
      <AnimatePresence>
        {showFiltersTray && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4 shadow-xl">
              {/* Filter Row 1: Categories / Tags */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C084FC]">
                  Category View
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[
                    { id: "all", label: "All Frames" },
                    { id: "group", label: "Group Photos" },
                    { id: "chief", label: "VIP / Stage" },
                    { id: "favorites", label: `Saved (${favoriteIds.length})` },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onTabChange?.(cat.id as any)}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                        activeTab === cat.id
                          ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white shadow-sm shadow-purple-950/40"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Row 2: Camera Models */}
              {availableCameras && availableCameras.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C084FC] flex items-center gap-1.5">
                    <Camera size={11} />
                    <span>Camera Hardware</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onCameraChange?.("all")}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer",
                        selectedCamera === "all"
                          ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      )}
                    >
                      All Cameras
                    </button>
                    {availableCameras.map((cam) => (
                      <button
                        key={cam}
                        type="button"
                        onClick={() => onCameraChange?.(selectedCamera === cam ? "all" : cam)}
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer",
                          selectedCamera === cam
                            ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                        )}
                      >
                        {cam}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Row 3: Faces & People */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C084FC] flex items-center gap-1.5">
                  <Users size={11} />
                  <span>People & Faces</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleFaceSort}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer",
                      showFaceSort
                        ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    )}
                  >
                    <Sparkles size={12} className="text-[#C084FC]" />
                    <span>{showFaceSort ? "Hide Face Clusters" : "Show Face Clusters"}</span>
                  </button>

                  {hasActiveAdvancedFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetFilters?.();
                        onCameraChange?.("all");
                        onTabChange?.("all");
                      }}
                      className="ml-auto text-xs text-white/40 hover:text-white underline transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

function ToolbarButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC] cursor-pointer shadow-sm",
        active
          ? "bg-purple-600/30 border-[#C084FC] text-white shadow-purple-950/40"
          : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
