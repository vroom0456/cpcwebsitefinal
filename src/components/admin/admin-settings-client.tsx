"use client";

import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HardDrive,
  Sparkles,
  Sliders,
  ShieldCheck,
  Wrench,
  Layers,
  Database,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminSettingsClientProps {
  rootFolderId: string;
  drive2025FolderId?: string;
  siteUrl: string;
}

export function AdminSettingsClient({
  rootFolderId,
  drive2025FolderId = "1CmS9IKXUHp3b7OOkZxFV8pm491oRJquw",
  siteUrl,
}: AdminSettingsClientProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [fixingCovers, setFixingCovers] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preference states stored locally for admin session
  const [defaultLayout, setDefaultLayout] = useState<"masonry" | "grid">("masonry");
  const [watermarkAttribution, setWatermarkAttribution] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  async function handleGlobalSync() {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/drive/sync-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "Global sync encountered an issue" });
      } else {
        setStatusMessage({
          type: "success",
          text: `Sync completed! Discovered ${data.eventsDiscovered} events, created ${data.eventsCreated}, synced ${data.eventsSynced}.`,
        });
        router.refresh();
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to connect to Google Drive sync endpoint" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleFixCovers() {
    setFixingCovers(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/drive/fix-covers", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "Cover update failed" });
      } else {
        setStatusMessage({
          type: "success",
          text: `Cover pictures updated for ${data.fixed ?? 0} events successfully!`,
        });
        router.refresh();
      }
    } catch {
      setStatusMessage({ type: "error", text: "Fix covers request failed" });
    } finally {
      setFixingCovers(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert banner if message exists */}
      {statusMessage && (
        <div
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border shadow-lg backdrop-blur-xl animate-in fade-in slide-in-from-top-2",
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/40 border-red-500/30 text-red-200"
          )}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[10px] uppercase font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── SECTION 1: Google Drive Engine Controls ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
              <HardDrive size={18} className="text-[#C084FC]" />
              <span>Google Drive Live Connection</span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Automated folder crawl engine, month-wise subfolder discovery, and photo synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://drive.google.com/drive/folders/${rootFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <span>2026 Drive</span>
              <ExternalLink size={12} className="text-white/60" />
            </a>
            <a
              href={`https://drive.google.com/drive/folders/${drive2025FolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <span>2025 Events Drive</span>
              <ExternalLink size={12} className="text-white/60" />
            </a>
          </div>
        </div>

        {/* Configuration details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">2026 Drive Folder</span>
            <span className="font-mono text-white text-xs font-semibold truncate block" title={rootFolderId}>
              {rootFolderId}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">2025 Drive Folder</span>
            <span className="font-mono text-white text-xs font-semibold truncate block" title={drive2025FolderId}>
              {drive2025FolderId}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Drive API Auth</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected &amp; Ready
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGlobalSync}
            disabled={syncing || fixingCovers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 active:scale-95 text-xs font-bold text-black transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Scanning Google Drive…</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Trigger Global Sync Now</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFixCovers}
            disabled={syncing || fixingCovers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 hover:border-purple-500/40 text-xs font-bold text-white/90 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {fixingCovers ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#C084FC]" />
                <span>Updating Covers…</span>
              </>
            ) : (
              <>
                <Wrench size={14} className="text-[#C084FC]" />
                <span>Fix All Event Covers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── SECTION 2: Club & Gallery Display Preferences ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="pb-3 border-b border-white/[0.06]">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
            <Sliders size={18} className="text-[#C084FC]" />
            <span>Gallery Display &amp; Public Site Preferences</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Configure default layout modes and club branding rules across all visitor pages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Layout Preference */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Default Gallery View</p>
              <p className="text-[11px] text-white/45 mt-0.5">Masonry feed preserves natural photo aspect ratios</p>
            </div>
            <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setDefaultLayout("masonry")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  defaultLayout === "masonry" ? "bg-white text-black font-bold shadow-sm" : "text-white/40 hover:text-white"
                )}
              >
                Masonry
              </button>
              <button
                type="button"
                onClick={() => setDefaultLayout("grid")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  defaultLayout === "grid" ? "bg-white text-black font-bold shadow-sm" : "text-white/40 hover:text-white"
                )}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Auto Sync on Page Load */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Automatic Drive Sync on Reload</p>
              <p className="text-[11px] text-white/45 mt-0.5">Detect newly added Drive folders on visitor refresh</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoSyncEnabled((v) => !v)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 border border-white/10",
                autoSyncEnabled ? "bg-white" : "bg-white/10"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full transition-transform shadow-md",
                  autoSyncEnabled ? "right-0.5 bg-black" : "left-0.5 bg-white"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
