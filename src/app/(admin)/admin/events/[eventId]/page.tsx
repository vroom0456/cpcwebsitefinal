import Link from "next/link";
import { ArrowLeft, Sparkles, Tag, Settings, Image as ImageIcon, ExternalLink, Sliders, Calendar, MapPin, Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getEventByIdAdmin } from "@/lib/services/events.service";
import { getPhotosForEventAdmin } from "@/lib/services/photos.service";
import { getTags, getEventTagIds } from "@/lib/services/tags.service";
import { getEventAnalytics } from "@/lib/services/analytics.service";
import { EventForm } from "@/components/admin/event-form";
import { GalleryClient } from "@/components/public/gallery-client";
import { GalleryHero } from "@/components/public/gallery-hero";
import { EventTagPicker } from "@/components/admin/event-tag-picker";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { FeatureHomeButton } from "@/components/admin/feature-home-button";
import { StatCard } from "@/components/admin/stat-card";
import { formatBytes, resolveEventDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminCoverCropTrigger } from "@/components/admin/admin-cover-crop-trigger";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SingleEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function SingleEventPage({ params }: SingleEventPageProps) {
  await requireAdmin();
  const { eventId } = await params;
  const event = await getEventByIdAdmin(eventId);
  if (!event) notFound();

  const [photos, allTags, eventTagIds, analytics, featuredLog] = await Promise.all([
    getPhotosForEventAdmin(event.id),
    getTags().catch(() => []),
    getEventTagIds(event.id).catch(() => []),
    getEventAnalytics(event.id).catch(() => null),
    createAdminClient()
      .from("activity_logs")
      .select("event_id")
      .eq("action", "featured_home")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((res: any) => res.data)
      .catch(() => null),
  ]);

  const isFeatured = featuredLog?.event_id
    ? featuredLog.event_id === event.id
    : event.organizing_club === "featured_home";

  const formattedDate = resolveEventDate(event);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* ── SECTION 1: FULL-BLEED LIVE WEBSITE CINEMATIC HERO (EDGE-TO-EDGE) ── */}
      <div className="-mx-3.5 sm:-mx-8 lg:-mx-12 -mt-4 sm:-mt-6 mb-6 sm:mb-8 relative overflow-hidden">
        <GalleryHero event={event} photoCount={photos.length} />

        {/* Floating Quick Admin Dock on top of the hero banner */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-10 z-30 flex items-center gap-2">
          <AdminCoverCropTrigger eventId={event.id} coverPhotoUrl={event.cover_photo_url} />
          <Link
            href={`/gallery/${event.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-[#9D5EE5] text-white/90 hover:text-white backdrop-blur-md border border-white/20 hover:border-purple-400 text-xs font-mono font-medium shadow-xl transition-all"
            title="View Live Public Event Page"
          >
            <span>Live Public Page</span>
            <ExternalLink size={12} />
          </Link>
          <FeatureHomeButton eventId={event.id} isFeaturedInitial={isFeatured} />
          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
        </div>
      </div>

      {/* ── SECTION 2: STAT CARDS SUMMARY ── */}
      {analytics && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Photos" value={photos.length} />
          <StatCard label="Public Views" value={analytics.total_views} />
          <StatCard label="Downloads" value={analytics.total_downloads} />
          <StatCard label="Vault Storage" value={formatBytes(analytics.storage_bytes)} />
        </section>
      )}

      {/* ── SECTION 3: EVENT DETAILS EDIT & EVENT TAGS (PLACED DIRECTLY ABOVE ARCHIVE) ── */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
          <div className="flex items-center gap-2.5">
            <Sliders size={20} className="text-[#C084FC]" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Event Management &amp; Details
              </h2>
              <p className="text-xs text-white/50">
                Configure event metadata, campus venue, organizing club, timing, and search tags
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            {event.status === "published" ? "🟢 Live Published" : "🟡 Draft Hidden"}
          </span>
        </div>

        {/* 1. Event Details Edit Form (Main Section) */}
        <div className="glass-card rounded-3xl border border-white/[0.08] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-white/[0.06]">
            <Settings size={17} className="text-[#C084FC]" />
            <h3 className="font-display text-base font-bold text-white">
              Edit Details, Venue, Organizing Club &amp; Timings
            </h3>
          </div>
          <EventForm event={event} submitLabel="Save Event Details" />
        </div>

        {/* 2. Event Tags & Classification (Directly Alongside Details) */}
        <div className="glass-card rounded-3xl border border-white/[0.08] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Tag size={17} className="text-[#C084FC]" />
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Event Tags &amp; Search Classifications
                </h3>
                <p className="text-xs text-white/50">
                  Assign relevant campus tags to boost discoverability across public filters and search
                </p>
              </div>
            </div>
          </div>
          <EventTagPicker eventId={event.id} allTags={allTags} initialTagIds={eventTagIds} />
        </div>
      </section>

      {/* ── SECTION 4: LIVE WEBSITE PHOTO GALLERY ARCHIVE (WITH ADMIN CONTROLS) ── */}
      <section className="space-y-4 pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#C084FC]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Event Photo Archive
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#9D5EE5]/20 text-[#C084FC] border border-[#9D5EE5]/30">
              {photos.length} photos
            </span>
          </div>
          <p className="text-xs text-white/40 hidden sm:block font-mono">
            Click photo to inspect EXIF &amp; download · Hover to set cover or crop
          </p>
        </div>

        {/* Unified Gallery Client */}
        <GalleryClient event={event} photos={photos} isAdmin={true} />
      </section>
    </div>
  );
}
