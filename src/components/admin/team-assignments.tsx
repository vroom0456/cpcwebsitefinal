"use client";

import { useState, useTransition } from "react";
import { setEventTeamRole } from "@/lib/actions/team-assignments.actions";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/database";
import { Shield, Users, Camera, Edit3, Check } from "lucide-react";

type TeamRole =
  | "photographyTeam"
  | "postProcessingTeam"
  | "photographyCoreCommittee"
  | "postProcessingCoreCommittee";

const ROLE_LABEL: Record<TeamRole, string> = {
  photographyTeam: "Photography Team",
  postProcessingTeam: "Post Processing Team",
  photographyCoreCommittee: "Photography Core Committee",
  postProcessingCoreCommittee: "Post Processing Core Committee",
};

interface TeamAssignmentsProps {
  eventId: string;
  members: Member[];
  assignments: {
    photographyTeam: string[];
    postProcessingTeam: string[];
    photographyCoreCommittee: string[];
    postProcessingCoreCommittee: string[];
  };
}

export function TeamAssignments({ eventId, members = [], assignments }: TeamAssignmentsProps) {
  const safeAssignments = assignments || {
    photographyTeam: [],
    postProcessingTeam: [],
    photographyCoreCommittee: [],
    postProcessingCoreCommittee: [],
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <RoleChecklist
        eventId={eventId}
        role="photographyCoreCommittee"
        members={members}
        initialMemberIds={safeAssignments.photographyCoreCommittee || []}
      />
      <RoleChecklist
        eventId={eventId}
        role="postProcessingCoreCommittee"
        members={members}
        initialMemberIds={safeAssignments.postProcessingCoreCommittee || []}
      />
      <RoleChecklist
        eventId={eventId}
        role="photographyTeam"
        members={members}
        initialMemberIds={safeAssignments.photographyTeam || []}
      />
      <RoleChecklist
        eventId={eventId}
        role="postProcessingTeam"
        members={members}
        initialMemberIds={safeAssignments.postProcessingTeam || []}
      />
    </div>
  );
}

function RoleChecklist({
  eventId,
  role,
  members = [],
  initialMemberIds = [],
}: {
  eventId: string;
  role: TeamRole;
  members: Member[];
  initialMemberIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(initialMemberIds));
  const [isPending, startTransition] = useTransition();
  const isCoreCommitteeRole = role.includes("CoreCommittee");

  function toggle(memberId: string) {
    const next = new Set(selected);
    next.has(memberId) ? next.delete(memberId) : next.add(memberId);
    setSelected(next);
    startTransition(() => setEventTeamRole(eventId, role, Array.from(next)));
  }

  // Core committee leadership roles are only offered to members flagged
  // is_core_committee; general team roles are open to everyone active.
  const eligibleMembers = (members || []).filter(
    (m) => m.status === "active" && (!isCoreCommitteeRole || m.is_core_committee)
  );

  return (
    <div className="rounded-2xl glass-card border border-purple-500/20 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
        <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
          {isCoreCommitteeRole ? (
            <Shield size={15} className="text-[#C084FC]" />
          ) : (
            <Users size={15} className="text-purple-400" />
          )}
          {ROLE_LABEL[role]}
        </h3>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-purple text-[#C084FC]">
          {selected.size} assigned
        </span>
      </div>

      <div className={cn("max-h-64 space-y-1.5 overflow-y-auto pr-1 scrollbar-none", isPending && "opacity-60")}>
        {eligibleMembers.length === 0 && (
          <p className="text-xs text-white/40 py-4 text-center">No eligible members found.</p>
        )}
        {eligibleMembers.map((member) => {
          const isChecked = selected.has(member.id);
          return (
            <label
              key={member.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all duration-200 border ${
                isChecked
                  ? "glass-purple border-purple-500/40 text-white shadow-sm"
                  : "glass border-transparent text-white/60 hover:text-white hover:border-purple-500/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(member.id)}
                  className="rounded border-purple-500/30 bg-[#050208] text-purple-600 focus:ring-purple-500 cursor-pointer h-4 w-4"
                />
                <span className="font-semibold">{member.name}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-purple-300/60 font-semibold">
                {member.position.replace(/_/g, " ")}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
