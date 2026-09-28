import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMemberById, getMemberEventCoverage, type CoverageEvent } from "@/lib/services/members.service";
import { MemberForm } from "@/components/admin/member-form";
import { DeleteMemberButton } from "@/components/admin/delete-member-button";
import { requireAdmin } from "@/lib/auth/require-admin";

interface EditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  await requireAdmin();
  const { memberId } = await params;
  const member = await getMemberById(memberId);
  if (!member) notFound();

  const coverage = await getMemberEventCoverage(memberId);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-3 border-b border-border pb-4">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border transition-colors"
        >
          <ArrowLeft size={14} /> Back to Team Hierarchy
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">{member.name}</h1>
          <DeleteMemberButton memberId={member.id} memberName={member.name} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CoverageList title="Photography Coverage" events={coverage.photography} />
        <CoverageList title="Post Processing Coverage" events={coverage.postProcessing} />
      </div>

      <MemberForm
        member={member}
        submitLabel="Save changes"
      />
    </div>
  );
}

function CoverageList({ title, events }: { title: string; events: CoverageEvent[] }) {
  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="mb-3 font-display text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <span>{event.title}</span>
                {event.event_date && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
