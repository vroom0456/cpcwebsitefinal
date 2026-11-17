"use client";

import { useState } from "react";
import { FileSpreadsheet, RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GoogleSheetSync() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    count?: number;
    added?: number;
    updated?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const router = useRouter();

  async function handleSync(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!sheetUrl.trim()) return;

    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/events/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl: sheetUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Failed to sync with Google Sheet" });
      } else {
        setResult(data);
        router.refresh();
      }
    } catch (err: any) {
      setResult({ error: err.message || "Network error while connecting to Google Sheet sync API" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#C084FC]/25 p-5 bg-[#0e0720]/80 shadow-[0_4px_30px_rgba(157,94,229,0.08)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#C084FC] shrink-0 mt-0.5">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Sync Events from Google Sheet / Excel
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[#C084FC] uppercase tracking-wider">
                Live Sync API
              </span>
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
              Paste a read-only or shared Google Sheet URL containing event columns (<code className="text-purple-300 font-mono text-[11px]">NAME OF EVENT</code>, <code className="text-purple-300 font-mono text-[11px]">ORGANIZER</code>, <code className="text-purple-300 font-mono text-[11px]">DATE OF EVENT</code>, <code className="text-purple-300 font-mono text-[11px]">EVENT LINK</code>, <code className="text-purple-300 font-mono text-[11px]">Covered By</code>). New events will be automatically imported into the website and database.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSync} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <input
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/1.../edit?usp=sharing"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#C084FC] focus:outline-none focus:ring-1 focus:ring-[#C084FC]/50 transition-all font-mono"
            disabled={syncing}
          />
        </div>
        <button
          type="submit"
          disabled={syncing || !sheetUrl.trim()}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 shrink-0 cursor-pointer",
            syncing || !sheetUrl.trim()
              ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              : "btn-primary-glow hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#C084FC]" />
              <span>Syncing Events…</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Sync Google Sheet</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </>
          )}
        </button>
      </form>

      {/* Result feedback */}
      {result?.error && (
        <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-500/25 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-red-200">Sync Error: </strong>
            {result.error}
          </div>
        </div>
      )}

      {result?.success && (
        <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-emerald-200">Sync Successful: </strong>
            Processed {result.count} events ({result.added} newly added, {result.updated} updated). All changes have been synced to the website catalog.
          </div>
        </div>
      )}
    </div>
  );
}
