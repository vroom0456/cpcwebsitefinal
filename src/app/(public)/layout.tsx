import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { ScrollRestorationProvider } from "@/components/public/ScrollRestorationProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-[#F8F5FB] relative w-full overflow-x-hidden">
      {/* Static dark canvas */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#050208]" />

      {/* Cinematic grain — very subtle texture, non-distracting */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.022] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      {/* Viewfinder corner marks — desktop only, purely decorative */}
      <div aria-hidden className="hidden md:block pointer-events-none fixed inset-6 z-[2] border border-white/[0.015] rounded-[2.5rem]">
        <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-white/[0.05]" />
        <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-white/[0.05]" />
        <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-white/[0.05]" />
        <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-white/[0.05]" />
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
