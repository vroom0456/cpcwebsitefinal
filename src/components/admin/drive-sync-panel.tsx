"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, RefreshCw, FolderSearch, Loader2, AlertCircle, Clock, Camera } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { SyncReport } from "@/lib/drive/drive.service";
import { cn } from "@/lib/utils";

interface EventRow {
  id: string;
  title: string;
  drive_folder_id: string | null;
  drive_last_synced_at: string | null;
  photo_count: number;
  storage_bytes: number;
}

export function DriveSyncPanel({ event }: { event: EventRow }) {
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [busy, setBusy] = useState<"validate" | "sync" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate() {
    if (!event.drive_folder_id) return;
    setBusy("validate");
    setError(null);
    try {
      const res = await fetch("/api/drive/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: event.drive_folder_id }),
      });
      const data = await res.json();
      setValidation(
        data.valid
          ? { valid: true, message: `"${data.folderName}" — ${data.imageCount}+ images visible` }
          : { valid: false, message: data.error ?? "Could not validate folder" }
      );
    } catch {
      setValidation({ valid: false, message: "Request failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleSync() {
    if (!event.drive_folder_id) return;
    setBusy("sync");
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/drive/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Sync failed");
      else setReport(data);
    } catch {
      setError("Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-all duration-300 border",
        busy === "sync"
          ? "bg-purple-950/30 border-purple-500/40 shadow-[0_0_30px_rgba(157,94,229,0.1)]"
          : report
          ? "bg-emerald-950/20 border-emerald-500/25"
          : "bg-white/[0.03] border-white/[0.08] hover:border-purple-500/25 hover:bg-white/[0.04]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Event Info */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/events/${event.id}`}
            className="font-bold text-sm text-white hover:text-[#C084FC] transition-colors truncate block"
          >
            {event.title}
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] font-mono text-white/40">
              <Camera size={10} className="text-[#C084FC]/60" />
              {event.photo_count} photos
            </span>
            {event.storage_bytes > 0 && (
              <span className="text-[11px] font-mono text-white/30">
                {formatBytes(event.storage_bytes)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-mono text-white/30">
              <Clock size={10} />
              {event.drive_last_synced_at
                ? `Synced ${new Date(event.drive_last_synced_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`
                : "Never synced"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {event.drive_folder_id ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleValidate}
              disabled={busy !== null}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border",
                busy === "validate"
                  ? "glass-purple border-purple-500/40 text-[#C084FC]"
                  : "glass text-white/60 border-purple-500/20 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10",
                busy !== null && busy !== "validate" && "opacity-50 pointer-events-none"
              )}
            >
              {busy === "validate" ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…</>
              ) : (
                <><FolderSearch className="h-3.5 w-3.5" /> Validate</>
              )}
            </button>
            <button
              onClick={handleSync}
              disabled={busy !== null}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer",
                busy === "sync"
                  ? "bg-purple-600/80 text-white shadow-[0_0_20px_rgba(157,94,229,0.4)]"
                  : "btn-primary-glow text-white hover:scale-[1.02] active:scale-[0.98]",
                busy !== null && busy !== "sync" && "opacity-50 pointer-events-none"
              )}
            >
              {busy === "sync" ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing…</>
              ) : (
                <><RefreshCw className="h-3.5 w-3.5" /> Sync Now</>
              )}
            </button>
          </div>
        ) : (
          <Link
            href={`/admin/events/${event.id}`}
            className="text-[11px] text-[#C084FC]/70 hover:text-[#C084FC] underline underline-offset-2 transition-colors shrink-0"
          >
            Add Drive Folder →
          </Link>
        )}
      </div>

      {/* Validation result */}
      {validation && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] font-medium border",
            validation.valid
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-red-500/10 border-red-500/25 text-red-300"
          )}
        >
          {validation.valid ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {validation.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] font-medium bg-red-500/10 border border-red-500/25 text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Sync Report */}
      {report && (
        <div className="mt-3 rounded-xl bg-emerald-900/20 border border-emerald-500/20 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[12px] font-bold">
            <CheckCircle2 className="h-4 w-4" />
            Sync completed successfully
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] font-mono text-white/60">
            <span className="text-emerald-300/80">+{report.added} added</span>
            {report.updated > 0 && <span className="text-blue-300/80">{report.updated} updated</span>}
            {report.missing.length > 0 && (
              <span className="text-amber-300/80">{report.missing.length} missing from Drive</span>
            )}
            {report.duplicates.length > 0 && (
              <span className="text-white/40">{report.duplicates.length} duplicate sets</span>
            )}
          </div>
          {report.missing.length > 0 && (
            <p className="text-[10px] text-white/35 font-mono">
              Missing: {report.missing.map((m) => m.filename).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
