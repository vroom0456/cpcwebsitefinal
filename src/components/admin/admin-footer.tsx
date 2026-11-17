"use client";

import Link from "next/link";
import { ShieldCheck, Cpu } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#06030C]/60 py-6 mt-16 text-xs text-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: System status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-white/60">
            System Operational · Supabase RLS Active
          </span>
        </div>

        {/* Center: Branding */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck size={13} className="text-[#C084FC]" />
          <span>CBIT Photography Club · Core Committee Console</span>
        </div>

        {/* Right: Quick shortcuts */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-white/30">
          <span>⌘K Search</span>
          <span>·</span>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors underline underline-offset-2"
          >
            Public Site
          </Link>
        </div>
      </div>
    </footer>
  );
}

