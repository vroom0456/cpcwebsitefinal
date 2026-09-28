import Link from "next/link";
import { ArrowLeft, Sparkles, Tag, Users, Settings, Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { getEventByIdAdmin } from "@/lib/services/events.service";
import { getPhotosForEventAdmin } from "@/lib/services/photos.service";
import { getMembers, getEventTeamAssignments } from "@/lib/services/members.service";
import { getTags, getEventTagIds } from "@/lib/services/tags.service";
import { getEventAnalytics } from "@/lib/services/analytics.service";
import { EventForm } from "@/components/admin/event-form";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { EventTagPicker } from "@/components/admin/event-tag-picker";
import { TeamAssignments } from "@/components/admin/team-assignments";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { StatCard } from "@/components/admin/stat-card";
import { formatBytes } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/require-admin";

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

  return (
    <div className="max-w-6xl space-y-8">
      {/* ── Top Header Banner ── */}
      <div className="space-y-4 border-b border-purple-500/15 pb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Events List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[#C084FC]" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
                Event Management Workspace
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">{event.title}</h1>
            <p className="text-xs text-white/50 mt-1">
              {event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : event.academic_year || "2025-26"}
              {event.timings && ` · ${event.timings}`}
              {event.venue && ` · ${event.venue}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DeleteEventButton eventId={event.id} eventTitle={event.title} />
          </div>
        </div>
      </div>

      {/* ── Stat Cards Summary ── */}
      {analytics && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Photos" value={analytics.total_photos} />
          <StatCard label="Views" value={analytics.total_views} />
          <StatCard label="Downloads" value={analytics.total_downloads} />
          <StatCard label="Storage" value={formatBytes(analytics.storage_bytes)} />
        </section>
      )}

      {/* ── SECTION 1: PHOTO GALLERY MANAGER ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-[#C084FC]" /> Photo Gallery ({photos.length} photos)
          </h2>
        </div>
        <GalleryManager eventId={event.id} event={event} photos={photos} isAdmin={true} />
      </section>

      {/* ── SECTION 2: EVENT DETAILS & TIMINGS CONFIGURATION ── */}
      <section className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-purple-500/15">
          <Settings size={18} className="text-[#C084FC]" /> Edit Details, Date &amp; Timings
        </h2>
        <EventForm event={event} submitLabel="Save Event Details" />
      </section>

      {/* ── SECTION 3: TEAM & CORE COMMITTEE ASSIGNMENTS ── */}
      <section className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-purple-500/15">
          <Users size={18} className="text-[#C084FC]" /> Team &amp; Core Committee Assignments
        </h2>
        <TeamAssignments eventId={event.id} members={members} assignments={assignments} />
      </section>

      {/* ── SECTION 4: EVENT TAGS ── */}
      <section className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-2xl space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-purple-500/15">
          <Tag size={18} className="text-[#C084FC]" /> Event Tags
        </h2>
        <EventTagPicker eventId={event.id} allTags={allTags} initialTagIds={eventTagIds} />
      </section>
    </div>
  );
}
