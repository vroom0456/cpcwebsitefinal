"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUniversalAdmin } from "@/lib/actions/auth.actions";
import Link from "next/link";
import { ShieldCheck, KeyRound, ArrowRight, ArrowLeft, Lock, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not_authorized"
      ? "This account is not an active Core Committee member."
      : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginUniversalAdmin(identifier, password);
    setLoading(false);

    if (res.success) {
      router.push(searchParams.get("redirectTo") ?? "/admin");
      router.refresh();
      return;
    }

    setError(res.error || "Authentication failed. Please verify your credentials.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20 bg-[#050208] text-white">
      <div className="w-full max-w-md space-y-7 glass-card p-8 sm:p-10 rounded-3xl border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle Glow Circle Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        {/* Back navigation */}
        <div className="relative z-10 flex items-center justify-between pb-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-mono text-white/70 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all group"
          >
            <ArrowLeft size={13} className="text-[#C084FC] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Website</span>
          </Link>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            SECURE PORTAL
          </span>
        </div>

        <div className="text-center space-y-2.5 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-purple border border-purple-500/30 text-[#C084FC] mb-1">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Core Committee Portal
          </h1>
          <p className="text-xs text-white/50 max-w-xs mx-auto leading-relaxed">
            Authentication portal for active CBIT Photography Club leadership and admins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-300 flex items-center gap-2">
              <Lock size={14} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
              CC Username or Email
            </label>
            <div className="relative">
              <input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. varunteja or president@cbitphotoclub.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-purple-500/25 glass px-4 py-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 transition-all"
              />
              <UserCheck size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
              Personal Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your personal CC password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-purple-500/25 glass px-4 py-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 transition-all"
              />
              <KeyRound size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl btn-primary-glow py-3.5 text-xs font-bold text-white uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating…" : "Access Dashboard"}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.06] text-center">
          <p className="text-[10px] text-white/30 font-mono">
            Protected by HMAC-SHA256 Encrypted Sessions · CBIT Photography Club
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050208]">
          <p className="text-xs text-purple-300 animate-pulse font-mono">Loading Portal...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
