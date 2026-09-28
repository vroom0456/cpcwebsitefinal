import type { EventTeamRole, PublicEventTeamMember } from "@/types/database";
import { Users2 } from "lucide-react";

function byRole(members: PublicEventTeamMember[], role: EventTeamRole) {
  return members.filter((m) => m.role === role);
}

function MemberPill({ member }: { member: PublicEventTeamMember }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-[#F8F5FB]/70 transition-all duration-200 hover:border-cpcLight/30 hover:text-[#F8F5FB]">
      {member.name}
      {member.position !== "member" && (
        <span className="text-[10px] text-cpcLight/60 capitalize">
          · {member.position.replace("_", " ")}
        </span>
      )}
    </span>
  );
}

function TeamGroup({
  title,
  members,
}: {
  title: string;
  members: PublicEventTeamMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#F8F5FB]/25 mb-3">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <MemberPill key={m.member_id} member={m} />
        ))}
      </div>
    </div>
  );
}

/** Original export kept for backwards compatibility */
export function EventTeamSection({ team, isAdmin = false }: { team: PublicEventTeamMember[]; isAdmin?: boolean }) {
  return <PremiumTeamSection team={team} isAdmin={isAdmin} />;
}

/** Premium styled team section — ONLY visible for Admins */
export function PremiumTeamSection({ team, isAdmin = false }: { team: PublicEventTeamMember[]; isAdmin?: boolean }) {
  if (!isAdmin) {
    return null;
  }

  const photographyTeam = byRole(team, "photography_team");
  const postProcessingTeam = byRole(team, "post_processing_team");
  const photographyCC = byRole(team, "photography_core_committee");
  const postProcessingCC = byRole(team, "post_processing_core_committee");

  const totalContributors = photographyTeam.length + postProcessingTeam.length;
  if (totalContributors === 0 && photographyCC.length === 0 && postProcessingCC.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-purple-500/20 bg-[#0B0515] p-6 shadow-xl space-y-4"
      aria-label="Event Credits"
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30">
            <Users2 size={14} className="text-[#C084FC]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Photography &amp; Post Processing Teams
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C084FC] border border-purple-500/40">
                Admin View Only
              </span>
            </h2>
            <p className="text-[11px] text-white/45">
              {totalContributors} assigned contributor{totalContributors !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TeamGroup title="Photography Team" members={photographyTeam} />
        <TeamGroup title="Post Processing Team" members={postProcessingTeam} />
        {photographyCC.length > 0 && (
          <TeamGroup title="Photography CC" members={photographyCC} />
        )}
        {postProcessingCC.length > 0 && (
          <TeamGroup title="Post Processing CC" members={postProcessingCC} />
        )}
      </div>
    </section>
  );
}
