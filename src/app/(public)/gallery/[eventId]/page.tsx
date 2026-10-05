export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getEventById,
  incrementEventViews,
  getEventTeamPublic,
} from "@/lib/services/events.service";
import { getPhotosForEvent } from "@/lib/services/photos.service";
import { GalleryClient } from "@/components/public/gallery-client";
import { GalleryHero } from "@/components/public/gallery-hero";
import { PremiumTeamSection } from "@/components/public/event-team-section";
import { EventDetailGrid } from "@/components/public/event-detail-grid";
import { siteConfig } from "@/config/site";
import { coverPhotoSrc } from "@/lib/utils";

interface GalleryPageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) return {};

  const ogImage = event.cover_photo_url
    ? coverPhotoSrc(event.cover_photo_url, 1200)
    : undefined;

  return {
    title: event.title,
    description: event.description ?? `Photos from ${event.title}`,
    alternates: { canonical: `${siteConfig.url}/gallery/${event.id}` },
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
      type: "website",
    },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const [photos, team] = await Promise.all([
    getPhotosForEvent(event.id),
    getEventTeamPublic(event.id).catch(() => []),
  ]);

  incrementEventViews(eventId).catch(() => {});

  const heroCover = event.cover_photo_url
    ? coverPhotoSrc(event.cover_photo_url, 1600)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.event_date ?? undefined,
    location: event.venue ? { "@type": "Place", name: event.venue } : undefined,
    image: heroCover ?? undefined,
    organizer: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    url: `${siteConfig.url}/gallery/${event.id}`,
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB]">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Full-bleed cinematic hero ── */}
      <GalleryHero event={event} photoCount={photos.length} />

      {/* ── Main content ── */}
      <div className="max-w-screen-xl mx-auto px-3.5 sm:px-8 lg:px-12">

        {/* ── GALLERY — strictly public view ── */}
        <section className="py-6 sm:py-14">
          <GalleryClient event={event} photos={photos} isAdmin={false} />
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-white/[0.05]" />

        {/* ── About + Credits ── */}
        {(event.description || team.length > 0) && (
          <section className="py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
            {event.description && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/40 mb-4">
                  About this event
                </p>
                <p className="text-base leading-[1.85] text-white/65">
                  {event.description}
                </p>
              </div>
            )}

            {team.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/40 mb-4">
                  Photography Credits
                </p>
                <PremiumTeamSection team={team} isAdmin={false} />
              </div>
            )}
          </section>
        )}



      </div>
    </div>
  );
}
