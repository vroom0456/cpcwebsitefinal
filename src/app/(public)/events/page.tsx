import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedEvents, getEventFilterOptions } from "@/lib/services/events.service";
import { EventsPageClient } from "@/components/public/events-page-client";
import { EventGridSkeleton } from "@/components/public/event-grid-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { SyncButton } from "@/components/public/sync-button";
import { EventsPageHero } from "@/components/public/events-page-hero";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Events",
  description: "Browse every CBIT Photo Club photography event and gallery.",
};

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    department?: string;
    venue?: string;
    year?: string;
    category?: string;
    club?: string;
    month?: string;
  }>;
}

export default function EventsPage(props: EventsPageProps) {
  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] relative">
      <EventsPageHero />

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        <div className="h-px bg-white/[0.05] mb-8" />
        <Suspense fallback={<EventGridSkeleton />}>
          <EventsResults searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function EventsResults({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const [events, filterOptions] = await Promise.all([
    getPublishedEvents(),
    getEventFilterOptions(),
  ]);

  return (
    <EventsPageClient
      events={events}
      filterOptions={filterOptions}
      initialParams={params}
    />
  );
}
