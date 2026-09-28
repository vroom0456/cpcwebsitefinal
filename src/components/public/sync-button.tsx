"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/drive/sync-public", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error ?? "Sync failed" });
      } else {
        setResult({
          type: "success",
          text: `Synced ${data.eventsSynced} events (${data.eventsCreated} new)`,
        });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch {
      setResult({ type: "error", text: "Sync request failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing from Drive..." : "Sync from Drive"}
      </Button>
      {result && (
        <span
          className={`text-xs px-2.5 py-1 rounded border font-medium ${
            result.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {result.text}
        </span>
      )}
    </div>
  );
}
