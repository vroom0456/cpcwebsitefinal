"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, ImageIcon, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalDriveSync() {
  const [syncing, setSyncing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [fixResult, setFixResult] = useState<{ fixed?: number; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSyncAll() {
    setSyncing(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/drive/sync-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Global sync failed");
      } else {
        setReport(data);
        router.refresh();
      }
    } catch {
      setError("Request failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleFixCovers() {
    setFixing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/drive/fix-covers", { method: "POST" });
      const data = await res.json();
      setFixResult(data);
      router.refresh();
    } catch {
      setFixResult({ error: "Request failed" });
    } finally {
      setFixing(false);
    }
  }

  return (
    <div className="mb-6 space-y-3">
      {/* ── Sync All Panel ── */}
      <div className="rounded-xl border border-purple-500/20 p-5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-sm text-white">Global Drive Sync</h3>
            <p className="text-xs text-white/45 mt-0.5">
              Recursively scan the root Drive folder to auto-create missing events and sync all photos.
            </p>
          </div>
          <Button
            onClick={handleSyncAll}
            disabled={syncing || fixing}
            className="shrink-0 btn-primary-glow text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {syncing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing All…</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" /> Sync All from Drive</>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {report && (
          <div className="mt-3 rounded-lg bg-emerald-900/20 border border-emerald-500/20 p-3 text-sm space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Global Sync Completed</span>
            </div>
            <p className="text-xs text-white/50">
              Discovered: {report.eventsDiscovered} · Created: {report.eventsCreated} · Synced: {report.eventsSynced}
            </p>
            {report.details?.length > 0 && (
              <div className="mt-2 text-xs border-t border-white/10 pt-2 max-h-40 overflow-y-auto">
                <span className="font-semibold text-white">Details:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-white/50">
                  {report.details.map((d: any, i: number) => (
                    <li key={i}>{d.folderName}: added {d.addedPhotos}, updated {d.updatedPhotos}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.errors?.length > 0 && (
              <div className="mt-2 text-xs border-t border-white/10 pt-2 max-h-40 overflow-y-auto text-red-400">
                <span className="font-semibold">Errors:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {report.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fix Covers Panel ── */}
      <div className={cn(
        "rounded-xl border p-5 bg-white/[0.02]",
        fixing ? "border-amber-500/30" : fixResult?.fixed ? "border-emerald-500/20" : "border-white/[0.07]"
      )}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Wrench size={14} className="text-amber-400" />
              Fix All Event Covers &amp; Thumbnails
            </h3>
            <p className="text-xs text-white/45 mt-0.5">
              Updates event cover photos from their first synced photo thumbnail. Run this after a fresh sync to make thumbnails appear on the Events and Gallery pages.
            </p>
          </div>
          <Button
            onClick={handleFixCovers}
            disabled={fixing || syncing}
            variant="outline"
            className="shrink-0 text-xs font-bold rounded-xl cursor-pointer border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            {fixing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fixing…</>
            ) : (
              <><ImageIcon className="mr-2 h-4 w-4" /> Fix All Thumbnails</>
            )}
          </Button>
        </div>

        {fixResult && (
          <div className={cn(
            "mt-3 flex items-center gap-2 text-sm rounded-lg p-3",
            fixResult.error
              ? "text-red-400 bg-red-900/10 border border-red-500/20"
              : "text-emerald-400 bg-emerald-900/10 border border-emerald-500/20"
          )}>
            {fixResult.error
              ? <><AlertCircle className="h-4 w-4 shrink-0" /><span>{fixResult.error}</span></>
              : <><CheckCircle2 className="h-4 w-4 shrink-0" /><span>Fixed cover photos for {fixResult.fixed} events!</span></>
            }
          </div>
        )}
      </div>
    </div>
  );
}
