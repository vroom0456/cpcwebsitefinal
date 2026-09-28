import type { Metadata } from "next";
import { getPublishedEvents, getEventFilterOptions } from "@/lib/services/events.service";
import { EventCard } from "@/components/public/event-card";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse CBIT Photo Club events by academic year.",
};

interface ArchivePageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { year } = await searchParams;
  const { academicYears } = await getEventFilterOptions();
  const activeYear = year ?? academicYears[0];
  const events = activeYear ? await getPublishedEvents({ academicYear: activeYear }) : [];

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] relative">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-28 pb-12 px-6 sm:px-10 lg:px-16">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-[50vw] h-[400px] opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, #4F168E 0%, transparent 70%)" }}
        />
        <div className="relative max-w-screen-xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.45em] uppercase text-[#9D5EE5] mb-4">
            Browse by Year
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F8F5FB] mb-10">
            Archive
          </h1>

          {/* Year filters */}
          {academicYears.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {academicYears.map((y) => (
                <a
                  key={y}
                  href={`/archive?year=${y}`}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    y === activeYear
                      ? "text-white shadow-[0_0_20px_-4px_rgba(157,94,229,0.5)]"
                      : "text-[#F8F5FB]/50 hover:text-[#F8F5FB]"
                  }`}
                  style={y === activeYear ? {
                    background: "rgba(79,22,142,0.25)",
                    border: "1px solid rgba(157,94,229,0.45)",
                    backdropFilter: "blur(12px)",
                  } : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(248,245,251,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {y}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Events grid ─────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        {/* Hairline divider */}
        <div className="h-px bg-[#F8F5FB]/6 mb-10" />

        {activeYear && (
          <p className="text-[13px] text-[#F8F5FB]/35 mb-8 font-medium">
            Showing {events.length} event{events.length !== 1 ? "s" : ""} from{" "}
            <span className="text-[#9D5EE5]">{activeYear}</span>
          </p>
        )}

        {events.length === 0 ? (
          <EmptyState
            title="No events for this year"
            description="Try selecting a different academic year above."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
