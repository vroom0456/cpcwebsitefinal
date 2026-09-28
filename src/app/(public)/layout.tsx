import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { ScrollRestorationProvider } from "@/components/public/ScrollRestorationProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-[#F8F5FB] relative w-full overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════
          FIXED VIOLET GRADIENT BACKGROUND — Covers entire viewport,
          stays put while content scrolls over it
          ════════════════════════════════════════════════════════════ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#050208]" />

        {/* Primary glow — top right (matches homepage hero exactly) */}
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

        {/* Secondary glow — bottom left */}
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

        {/* Centre accent — mid-screen breathing glow */}
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

        {/* Soft violet floor wash */}
        <div
          className="absolute pointer-events-none bottom-0 left-0 right-0"
          style={{
            height: "40%",
            background: "linear-gradient(to top, rgba(79,22,142,0.06) 0%, transparent 100%)",
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

      {/* ── Camera Viewfinder Frame Markings ── */}
      <div aria-hidden className="pointer-events-none fixed inset-6 z-[2] border border-white/[0.018] rounded-[2.5rem]">
        <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-white/[0.06]" />
        <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-white/[0.06]" />
        <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-white/[0.06]" />
        <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-white/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-[0.03]">
          <div className="w-4 h-px bg-[#F8F5FB]" />
          <div className="h-4 w-px bg-[#F8F5FB] absolute" />
          <div className="w-6 h-6 rounded-full border border-[#F8F5FB] absolute" />
        </div>
      </div>

      {/* ── Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] overflow-hidden">
        <div
          className="h-full origin-left"
          style={{
            background: "linear-gradient(90deg, #4F168E, #9D5EE5, #C084FC)",
            animation: "scrollProgress linear",
            animationTimeline: "scroll(root)",
          }}
        />
      </div>

      {/* ── Content Layer ── */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <ScrollRestorationProvider>
          <PublicNav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <PublicFooter />
        </ScrollRestorationProvider>
      </div>
    </div>
  );
}
