import type { EventTeamRole, PublicEventTeamMember } from "@/types/database";

function byRole(members: PublicEventTeamMember[], role: EventTeamRole) {
  return members.filter((m) => m.role === role);
}

function MemberPill({ member }: { member: PublicEventTeamMember }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-[#F8F5FB]/70 transition-all duration-200 hover:border-[#C084FC]/30 hover:text-[#F8F5FB]">
      {member.name}
      {member.position && member.position !== "member" && (
        <span className="text-[10px] text-[#C084FC]/70 capitalize">
          · {member.position.replace(/_/g, " ")}
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
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F8F5FB]/40">
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

/** Backwards-compatible export */
export function EventTeamSection({ team, isAdmin = false }: { team: PublicEventTeamMember[]; isAdmin?: boolean }) {
  return <PremiumTeamSection team={team} isAdmin={isAdmin} />;
}

/**
 * Event Credits Section:
 * Elegantly presents student photographers & editors with proper attribution.
 */
export function PremiumTeamSection({ team, isAdmin = false }: { team: PublicEventTeamMember[]; isAdmin?: boolean }) {
  const photographyTeam = byRole(team, "photography_team");
  const postProcessingTeam = byRole(team, "post_processing_team");
  const photographyCC = byRole(team, "photography_core_committee");
  const postProcessingCC = byRole(team, "post_processing_core_committee");

  const totalContributors = team.length;
  if (totalContributors === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C084FC] border border-purple-500/40">
            Admin View
          </span>
          <span className="text-[11px] text-white/40">
            {totalContributors} contributor{totalContributors !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="space-y-4">
        <TeamGroup title="Photography" members={photographyTeam} />
        <TeamGroup title="Post-Processing" members={postProcessingTeam} />
        {photographyCC.length > 0 && (
          <TeamGroup title="Photography Core" members={photographyCC} />
        )}
        {postProcessingCC.length > 0 && (
          <TeamGroup title="Post-Processing Core" members={postProcessingCC} />
        )}
      </div>
    </div>
  );
}
