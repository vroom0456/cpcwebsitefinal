import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, ArrowLeft, ExternalLink, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Portal Moved | CPC Admin Studio",
  robots: { index: false, follow: false },
};

export default function AdminLoginTransitionPage() {
  const adminStudioUrl =
    process.env.NEXT_PUBLIC_ADMIN_STUDIO_URL ||
    "https://admincpcwebsitefinal.vercel.app/login";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-20 bg-[#050208] text-white">
      <Card
        variant="default"
        className="w-full max-w-md p-8 sm:p-10 space-y-7 relative overflow-hidden glass-card border border-purple-500/20"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Back navigation */}
        <div className="relative z-10 flex items-center justify-between pb-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
            CPC Admin Studio
          </span>
        </div>

        {/* Portal Notice */}
        <div className="relative z-10 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F168E]/25 text-[#A986E8] border border-[#4F168E]/40 shadow-lg shadow-purple-900/30">
            <Camera className="h-7 w-7 text-purple-300" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Admin Studio Has Moved
          </h1>
          <p className="text-xs text-white/60 leading-relaxed">
            The CBIT Photography Club administration and media management portal is now hosted on its dedicated, high-performance platform.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-2 space-y-3">
          <a
            href={adminStudioUrl}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-purple-950/50 hover:brightness-110 active:scale-98 transition-all"
          >
            <span>Proceed to CPC Admin Studio</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="text-center text-[10px] text-white/40 font-mono">
            Requires active Core Committee credentials
          </p>
        </div>
      </Card>
    </div>
  );
}
