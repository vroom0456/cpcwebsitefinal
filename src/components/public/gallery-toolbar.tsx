"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Heart,
  Share2,
  CheckSquare,
  Loader2,
  X,
  RefreshCw,
  Search,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { useSelectionStore } from "@/store/selection-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadPhotosAsZip } from "@/lib/utils/download";
import { ShareDialog } from "@/components/public/share-dialog";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/database";

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
}: {
  eventTitle: string;
  photos: Photo[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenAIFaceSearch?: () => void;
  aiFaceMatchActive?: boolean;
  onToggleFaceSort?: () => void;
  showFaceSort?: boolean;
}) {
  const { selectedIds, clear } = useSelectionStore();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

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

  const [showMore, setShowMore] = useState(false);

  function handleCancel() {
    if (abortController) abortController.abort();
  }

  return (
    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-6">
      {/* ── Row 1: Photo Count + Clean Search Bar ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wider">
          <span className="text-white font-bold text-xs sm:text-sm">{photos.length}</span>
          <span>PHOTOGRAPHS</span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full max-w-md flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search photos in gallery…"
            className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[13px] bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/30 focus:outline-none focus:border-[#9D5EE5]/60 focus:ring-1 focus:ring-[#9D5EE5]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: Secondary Clean Action Strip ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5 relative">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
          {/* AI Face Search Trigger Button */}
          <button
            type="button"
            onClick={onOpenAIFaceSearch}
            className={cn(
              "px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-lg shrink-0",
              aiFaceMatchActive
                ? "bg-purple-600 text-white border border-purple-400 shadow-purple-900/50 animate-pulse"
                : "bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-purple-950/40 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400"
            )}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C084FC] animate-pulse" />
            <span>AI Find People</span>
          </button>

          <ToolbarButton
            active={selectMode}
            onClick={() => {
              if (selectMode) clear();
              onToggleSelectMode();
            }}
            icon={selectMode ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            label={selectMode ? `${selectedIds.size} selected` : "Select"}
          />

          {selectMode && selectedIds.size > 0 ? (
            <ToolbarButton
              active
              onClick={() => handleDownload(selectedPhotos, `${eventTitle}-selected.zip`)}
              icon={<Download className="h-3.5 w-3.5" />}
              label="Download selected"
            />
          ) : (
            <ToolbarButton
              onClick={() => handleDownload(photos, `${eventTitle}.zip`)}
              icon={<Download className="h-3.5 w-3.5" />}
              label="Download all"
            />
          )}

          <ToolbarButton
            onClick={() => setShareOpen(true)}
            icon={<Share2 className="h-3.5 w-3.5" />}
            label="Share"
          />

          {/* More Dropdown for Sync & Faces */}
          <div className="relative inline-block">
            <ToolbarButton
              active={showMore}
              onClick={() => setShowMore(!showMore)}
              icon={<MoreHorizontal className="h-3.5 w-3.5" />}
              label="More"
            />

            {showMore && (
              <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px] p-1.5 rounded-2xl bg-[#0F071D] border border-white/10 shadow-2xl space-y-1">
                <button
                  onClick={() => {
                    setShowMore(false);
                    onToggleFaceSort?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#C084FC]" />
                  <span>{showFaceSort ? "Hide Face Clusters" : "View Face Clusters"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMore(false);
                    handleSync();
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={cn("text-[#C084FC]", isSyncing && "animate-spin")} />
                  <span>{isSyncing ? "Syncing Drive…" : "Sync Drive Vault"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback or Download progress */}
        {feedbackMsg && (
          <span
            className={cn(
              "text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border font-medium shrink-0",
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-red-500/10 border-red-500/25 text-red-400"
            )}
          >
            {feedbackMsg.text}
          </span>
        )}

        {downloading && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/[0.08] px-3 py-1.5 text-[11px] shrink-0">
            <Loader2 className="h-3 w-3 animate-spin text-cpcLight" />
            <span className="font-medium text-[#F8F5FB]/60">
              {Math.round((downloading.done / downloading.total) * 100)}%
            </span>
            <button
              className="text-[9px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

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
        "inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-[12px] font-medium transition-all duration-200 border shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight cursor-pointer",
        active
          ? "bg-cpcPurple/20 border-cpcPurple/50 text-[#F8F5FB]"
          : "bg-white/[0.03] border-white/[0.07] text-[#F8F5FB]/55 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-[#F8F5FB]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
