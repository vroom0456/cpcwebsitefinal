import Link from "next/link";
import { ArrowLeft, Sparkles, Tag, Users, Settings, Image as ImageIcon, ExternalLink, Sliders } from "lucide-react";
import { notFound } from "next/navigation";
import { getEventByIdAdmin } from "@/lib/services/events.service";
import { getPhotosForEventAdmin } from "@/lib/services/photos.service";
import { getMembers, getEventTeamAssignments } from "@/lib/services/members.service";
import { getTags, getEventTagIds } from "@/lib/services/tags.service";
import { getEventAnalytics } from "@/lib/services/analytics.service";
import { EventForm } from "@/components/admin/event-form";
import { GalleryClient } from "@/components/public/gallery-client";
import { GalleryHero } from "@/components/public/gallery-hero";
import { EventTagPicker } from "@/components/admin/event-tag-picker";
import { TeamAssignments } from "@/components/admin/team-assignments";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { FeatureHomeButton } from "@/components/admin/feature-home-button";
import { StatCard } from "@/components/admin/stat-card";
import { formatBytes, resolveEventDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminCoverCropTrigger } from "@/components/admin/admin-cover-crop-trigger";

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

  const [photos, members, assignments, allTags, eventTagIds, analytics] = await Promise.all([
    getPhotosForEventAdmin(event.id),
    getMembers().catch(() => []),
    getEventTeamAssignments(event.id).catch(() => ({
      photographyTeam: [],
      postProcessingTeam: [],
      photographyCoreCommittee: [],
      postProcessingCoreCommittee: [],
    })),
    getTags().catch(() => []),
    getEventTagIds(event.id).catch(() => []),
    getEventAnalytics(event.id).catch(() => null),
  ]);

  const formattedDate = resolveEventDate(event);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
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
          <FeatureHomeButton eventId={event.id} isFeaturedInitial={event.organizing_club === "featured_home"} />
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

      {/* ── SECTION 3: DITTO LIVE WEBSITE PHOTO GALLERY (WITH ADMIN HOVER CONTROLS) ── */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#C084FC]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Event Photo Archive
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#9D5EE5]/20 text-[#C084FC] border border-[#9D5EE5]/30">
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

      {/* ── SECTION 4: ORGANIZED CONFIGURATION PANELS ── */}
      <div className="pt-6 border-t border-white/[0.08] space-y-6">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-[#C084FC]" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            Event Management &amp; Metadata Configuration
          </h2>
        </div>

        {/* 1. Edit Details, Dates & Timings */}
        <details className="glass-card rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
          <summary className="font-display text-base font-bold text-white flex items-center justify-between cursor-pointer list-none select-none">
            <span className="flex items-center gap-2">
              <Settings size={16} className="text-[#C084FC]" />
              Edit Details, Venue, Date &amp; Timings
            </span>
            <span className="text-xs font-mono text-[#C084FC] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-6 mt-4 border-t border-white/[0.06]">
            <EventForm event={event} submitLabel="Save Event Details" />
          </div>
        </details>

        {/* 2. Team & Core Committee Assignments */}
        <details className="glass-card rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
          <summary className="font-display text-base font-bold text-white flex items-center justify-between cursor-pointer list-none select-none">
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[#C084FC]" />
              Core Committee &amp; Photographer Assignments
            </span>
            <span className="text-xs font-mono text-[#C084FC] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-6 mt-4 border-t border-white/[0.06]">
            <TeamAssignments eventId={event.id} members={members} assignments={assignments} />
          </div>
        </details>

        {/* 3. Event Tags */}
        <details className="glass-card rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-xl group">
          <summary className="font-display text-base font-bold text-white flex items-center justify-between cursor-pointer list-none select-none">
            <span className="flex items-center gap-2">
              <Tag size={16} className="text-[#C084FC]" />
              Event Tags &amp; Classifications
            </span>
            <span className="text-xs font-mono text-[#C084FC] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-6 mt-4 border-t border-white/[0.06]">
            <EventTagPicker eventId={event.id} allTags={allTags} initialTagIds={eventTagIds} />
          </div>
        </details>
      </div>
    </div>
  );
}
