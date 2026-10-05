import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { AdminHeaderNav } from "@/components/admin/admin-header-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-[#F8F5FB] relative w-full overflow-x-hidden">
      {/* ── Fixed Violet Gradient Background (exact same as home page) ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#050208]" />

        {/* Primary glow top-right */}
        <div
          className="absolute pointer-events-none animate-[glow-pulse_6s_ease-in-out_infinite]"
          style={{
            top: "-15%",
            right: "-10%",
            width: "80vw",
            height: "80vw",
            maxWidth: "900px",
            maxHeight: "900px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,22,142,0.9) 0%, rgba(157,94,229,0.20) 40%, transparent 70%)",
            filter: "blur(60px)",
            opacity: 0.2,
          }}
        />

        {/* Bottom-left secondary glow */}
        <div
          className="absolute pointer-events-none animate-[float-orb_14s_ease-in-out_infinite]"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "60vw",
            height: "60vw",
            maxWidth: "700px",
            maxHeight: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(157,94,229,0.7) 0%, rgba(79,22,142,0.25) 50%, transparent 70%)",
            filter: "blur(80px)",
            opacity: 0.14,
          }}
        />

        {/* Centre accent */}
        <div
          className="absolute pointer-events-none animate-[glow-pulse_8s_ease-in-out_infinite_2s]"
          style={{
            top: "35%",
            left: "20%",
            width: "50vw",
            height: "50vw",
            maxWidth: "550px",
            maxHeight: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,132,252,0.35) 0%, rgba(157,94,229,0.12) 50%, transparent 70%)",
            filter: "blur(100px)",
            opacity: 0.1,
          }}
        />
      </div>

      {/* ── Dotted Grid Overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(157, 94, 229, 0.2) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* ── Cinematic Grain ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      {/* ── Header / Navigation Bar (Hidden on Mobile for Admin to Prevent Overcrowding) ── */}
      <div className="hidden md:block">
        <PublicNav />
      </div>

      {/* ── Main Centered Content Container ── */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 lg:px-12 pt-3 md:pt-32 pb-20 relative z-10">
        <AdminHeaderNav />
        {children}
      </main>

      {/* ── Footer (Exact same as home page) ── */}
      <PublicFooter />
    </div>
  );
}
