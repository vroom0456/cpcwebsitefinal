export const revalidate = 30;

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
import { siteConfig } from "@/config/site";
import { coverPhotoSrc, getPhotoDisplayUrl } from "@/lib/utils";

interface GalleryPageProps {
  params: Promise<{ eventId: string }>;
  searchParams?: Promise<{ photo?: string; p?: string }>;
}

export async function generateMetadata({ params, searchParams }: GalleryPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const { photo: photoId, p: altPhotoId } = (await searchParams) || {};
  const targetPhotoId = photoId || altPhotoId;

  const event = await getEventById(eventId);
  if (!event) return {};

  let ogImage = event.cover_photo_url
    ? coverPhotoSrc(event.cover_photo_url, 1200)
    : undefined;
  let title = event.title;
  let description = event.description ?? `Photos from ${event.title}`;

  if (targetPhotoId) {
    try {
      const photos = await getPhotosForEvent(eventId);
      const targetPhoto = photos.find(
        (p) => p.id === targetPhotoId || p.drive_file_id === targetPhotoId
      );
      if (targetPhoto) {
        ogImage = getPhotoDisplayUrl(targetPhoto, "full");
        title = `${targetPhoto.filename || "Photograph"} — ${event.title}`;
        description = `Photograph from ${event.title} • CBIT Photography Club`;
      }
    } catch {}
  } else if (!ogImage || ogImage.includes("placeholder-event.jpg")) {
    try {
      const photos = await getPhotosForEvent(eventId);
      if (photos && photos.length > 0) {
        const coverCandidate = photos.find((p) => p.is_cover) || photos[0];
        if (coverCandidate) {
          ogImage = getPhotoDisplayUrl(coverCandidate, "full");
        }
      }
    } catch {}
  }

  if (ogImage && ogImage.startsWith("/")) {
    ogImage = `${siteConfig.url}${ogImage}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/gallery/${event.id}${targetPhotoId ? `?photo=${encodeURIComponent(targetPhotoId)}` : ""}`,
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
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

        {/* ── Gallery ── */}
        <section className="py-6 sm:py-14">
          <GalleryClient event={event} photos={photos} isAdmin={false} />
        </section>

        {/* ── About + Credits ── */}
        {(event.description || team.length > 0) && (
          <>
            <div className="border-t border-white/[0.05]" />
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
          </>
        )}
      </div>
    </div>
  );
}
