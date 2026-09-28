import type { Metadata } from "next";
import { getPublishedEvents } from "@/lib/services/events.service";
import { EmptyState } from "@/components/shared/empty-state";
import { TimelineClient } from "@/components/public/timeline-client";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Every CBIT Photo Club event in chronological order — explore our visual journey.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TimelinePage() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] relative">
      {/* Page Hero */}
      <div className="relative overflow-hidden pt-32 pb-14 px-6 sm:px-10 lg:px-16">
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse at top, #9D5EE5 0%, transparent 70%)" }}
        />
        {/* Bg number */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-2%] top-[10%] font-black text-[22vw] leading-none text-white/[0.015] select-none"
          style={{ fontFamily: "var(--font-display, sans-serif)" }}
        >
          {new Date().getFullYear()}
        </div>

        <div className="relative max-w-screen-xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.45em] uppercase text-cpcLight/80 mb-4">Visual History</p>
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.0] tracking-[-0.03em] text-[#F8F5FB] mb-5">
            Timeline
          </h1>
          <p className="text-[#F8F5FB]/45 text-[15px] max-w-md leading-relaxed">
            Every CPC event in one place — swipe or scroll to browse, grouped by academic year and month.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        <div className="h-px bg-white/[0.05] mb-10" />
        {events.length === 0 ? (
          <EmptyState title="No events yet" description="Published events will appear here." />
        ) : (
          <TimelineClient events={events} />
        )}
      </div>
    </div>
  );
}
