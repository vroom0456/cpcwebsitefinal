"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to whatever error-tracking service is set up.
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#C084FC] flex items-center justify-center mb-4">
        <span className="font-mono text-lg font-bold">[ ! ]</span>
      </div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
        THE SHUTTER JAMMED
      </h1>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        We couldn&apos;t load this gallery frame right now. Check your connection or try releasing the shutter again.
      </p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E8D1FF] transition-all cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
