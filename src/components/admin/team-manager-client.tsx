"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Shield,
  Edit3,
  Plus,
  Search,
  X,
  Check,
  Trash2,
  GraduationCap,
  Award,
  Users,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateMember, createMember, deleteMember } from "@/lib/actions/members.actions";
import type { Member } from "@/types/database";

export function TeamManagerClient({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state for drawer
  const [formState, setFormState] = useState<Partial<Member>>({
    name: "",
    email: "",
    phone: "",
    department: "CPC",
    year: "12th Gen",
    position: "member",
    status: "active",
    is_core_committee: true,
    skills: [],
    profile_photo_url: "",
  });

  const [serverMsg, setServerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtered members
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        search.trim() === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.position.toLowerCase().includes(search.toLowerCase()) ||
        (m.department && m.department.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (activeTab === "faculty") return m.position === "faculty_coordinator" || m.year === "Faculty Coordinator";
      if (activeTab === "12th") return m.year === "12th Gen" || (m.status === "active" && m.position !== "faculty_coordinator");
      if (activeTab === "11th") return m.year === "11th Gen" || m.name.includes("11th");
      if (activeTab === "10th") return m.year === "10th Gen" || m.name.includes("10th");
      if (activeTab === "9th") return m.year === "9th Gen" || m.name.includes("9th");

      return true;
    });
  }, [members, search, activeTab]);

  // Hierarchical groupings
  const facultyCoord = useMemo(() => filtered.filter((m) => m.position === "faculty_coordinator" || m.year === "Faculty Coordinator"), [filtered]);
  const gen12 = useMemo(() => filtered.filter((m) => m.year === "12th Gen" || (m.status === "active" && m.position !== "faculty_coordinator")), [filtered]);
  const gen11 = useMemo(() => filtered.filter((m) => m.year === "11th Gen" || m.name.includes("11th")), [filtered]);
  const gen10 = useMemo(() => filtered.filter((m) => m.year === "10th Gen" || m.name.includes("10th")), [filtered]);
  const gen9 = useMemo(() => filtered.filter((m) => m.year === "9th Gen" || m.name.includes("9th")), [filtered]);
  const otherMembers = useMemo(
    () =>
      filtered.filter(
        (m) =>
          !facultyCoord.includes(m) &&
          !gen12.includes(m) &&
          !gen11.includes(m) &&
          !gen10.includes(m) &&
          !gen9.includes(m)
      ),
    [filtered, facultyCoord, gen12, gen11, gen10, gen9]
  );

  function openEdit(member: Member) {
    setEditingMember(member);
    setIsCreating(false);
    setFormState({ ...member });
    setServerMsg(null);
  }

  function openCreate() {
    setEditingMember(null);
    setIsCreating(true);
    setFormState({
      name: "",
      email: "",
      phone: "",
      department: "CPC",
      year: "12th Gen",
      position: "member",
      status: "active",
      is_core_committee: true,
      skills: [],
    });
    setServerMsg(null);
  }

  function closeDrawer() {
    setEditingMember(null);
    setIsCreating(false);
    setServerMsg(null);
  }

  async function handleQuickToggleStatus(member: Member) {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      try {
        await updateMember(member.id, {
          name: member.name,
          position: member.position,
          is_core_committee: member.is_core_committee,
          department: member.department ?? undefined,
          email: member.email ?? undefined,
          profile_photo_url: member.profile_photo_url ?? undefined,
          year: member.year ?? undefined,
          phone: member.phone ?? undefined,
          status: nextStatus,
        });
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
        );
      } catch (err: any) {
        alert(err.message || "Failed to toggle status");
      }
    });
  }

  async function handleFormSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formState.name) return;

    setServerMsg(null);
    startTransition(async () => {
      try {
        const payload = {
          name: formState.name!,
          email: formState.email || undefined,
          phone: formState.phone || undefined,
          department: formState.department || "CPC",
          year: formState.year || "12th Gen",
          position: formState.position || "member",
          status: (formState.status as "active" | "inactive" | "alumni") || "active",
          is_core_committee: formState.is_core_committee ?? true,
          profile_photo_url: formState.profile_photo_url || undefined,
        };

        if (isCreating) {
          await createMember(payload);
          // Create temporary optimistic member item
          const newMember: Member = {
            id: `new-${Date.now()}`,
            auth_user_id: null,
            name: payload.name,
            email: payload.email || null,
            phone: payload.phone || null,
            department: payload.department || null,
            year: payload.year || null,
            position: payload.position,
            status: payload.status,
            is_core_committee: payload.is_core_committee,
            skills: [],
            profile_photo_url: payload.profile_photo_url || null,
            joined_club: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setMembers((prev) => [newMember, ...prev]);
          setServerMsg({ type: "success", text: "Team member added successfully!" });
          setTimeout(closeDrawer, 800);
        } else if (editingMember) {
          await updateMember(editingMember.id, payload);
          setMembers((prev) =>
            prev.map((m) => (m.id === editingMember.id ? { ...m, ...payload } as Member : m))
          );
          setServerMsg({ type: "success", text: "Member updated successfully!" });
          setTimeout(closeDrawer, 800);
        }
      } catch (err: any) {
        setServerMsg({ type: "error", text: err.message || "Failed to save member" });
      }
    });
  }

  async function handleDeleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    startTransition(async () => {
      try {
        await deleteMember(id);
        setMembers((prev) => prev.filter((m) => m.id !== id));
        closeDrawer();
      } catch (err: any) {
        alert(err.message || "Failed to delete member");
      }
    });
  }

  function renderMemberTable(
    memberList: Member[],
    title: string,
    subtitle: string,
    icon: React.ReactNode
  ) {
    if (memberList.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl glass-purple text-[#C084FC]">
              {icon}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">{title}</h2>
              <p className="text-xs text-white/40">{subtitle}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full glass-purple text-[#C084FC]">
            {memberList.length} members
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl glass-card border border-purple-500/20 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-purple-500/20 glass-purple text-[#C084FC] font-bold">
              <tr>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest">Member Name</th>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest">Position / Role</th>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest">Department</th>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest">Generation</th>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-4 py-3.5 text-[10px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {memberList.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => openEdit(member)}
                  className="hover:bg-purple-500/15 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3.5 font-semibold text-white">
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="w-7 h-7 rounded-lg glass-purple flex items-center justify-center shrink-0 text-purple-300 font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span className="group-hover:text-[#C084FC] transition-colors font-semibold">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-purple-200/90 font-medium capitalize">
                    {member.position.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3.5 text-white/50">{member.department || "—"}</td>
                  <td className="px-4 py-3.5 text-white/50 font-medium">{member.year || "—"}</td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleQuickToggleStatus(member)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        member.status === "active"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                      }`}
                    >
                      {member.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-[#C084FC]">
                    <span className="text-[11px] hover:underline">Edit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
              Team Management
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Core Committee &amp; Team Members
          </h1>
          <p className="text-xs text-white/45 mt-1">
            Click any member row to edit details in-place. Use top buttons to filter or add new members in seconds.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="btn-primary-glow text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={15} className="mr-1.5" /> Add Team Member
        </Button>
      </div>

      {/* Search & Tabs Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9D5EE5]/70" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member, role, department..."
            className="pl-11 h-11 text-xs glass text-white placeholder:text-white/35 rounded-xl border-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All" },
            { id: "faculty", label: "Faculty" },
            { id: "12th", label: "12th Gen" },
            { id: "11th", label: "11th Gen" },
            { id: "10th", label: "10th Gen" },
            { id: "9th", label: "9th Gen" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "glass-purple text-white shadow-lg shadow-purple-950/40 scale-[1.02]"
                  : "glass text-white/50 hover:text-white hover:border-purple-500/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generation Tables Filtered by activeTab */}
      {(activeTab === "all" || activeTab === "faculty") &&
        renderMemberTable(
          facultyCoord,
          "Faculty Coordinator",
          "Advisory node at the top of club hierarchy",
          <GraduationCap className="h-5 w-5" />
        )}

      {(activeTab === "all" || activeTab === "12th") &&
        renderMemberTable(
          gen12,
          "12th Generation Core Committee (Current Active)",
          "Roles with customizable name slots for the active batch",
          <Award className="h-5 w-5" />
        )}

      {(activeTab === "all" || activeTab === "11th") &&
        renderMemberTable(
          gen11,
          "11th Generation Core Committee (2025-26)",
          "Roles and member names under President Adarsh",
          <Users className="h-5 w-5" />
        )}

      {(activeTab === "all" || activeTab === "10th") &&
        renderMemberTable(
          gen10,
          "10th Generation Core Committee (2024-25)",
          "Roles and member names under President Adithya Gella",
          <Users className="h-5 w-5" />
        )}

      {(activeTab === "all" || activeTab === "9th") &&
        renderMemberTable(
          gen9,
          "9th Generation Core Committee (2023-24)",
          "Roles and member names under President Cvn Praneeth",
          <Users className="h-5 w-5" />
        )}

      {activeTab === "all" && otherMembers.length > 0 &&
        renderMemberTable(
          otherMembers,
          "Other Members & Coordinators",
          "General team members",
          <Users className="h-5 w-5" />
        )}

      {/* IN-LINE SAME PAGE EDIT DRAWER MODAL */}
      {(editingMember || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-lg glass-card border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {isCreating ? "Add New Team Member" : `Edit Member: ${editingMember?.name}`}
                </h3>
                <p className="text-xs text-white/40">
                  {isCreating ? "Fill member details to add to team list" : "Update position, department, generation, or contact info"}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full glass text-white/50 hover:text-white hover:border-purple-500/40 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {serverMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  serverMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/15 border border-red-500/30 text-red-300"
                }`}
              >
                {serverMsg.text}
              </div>
            )}

            <form onSubmit={handleFormSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/60 font-semibold mb-1">Full Name *</label>
                <Input
                  value={formState.name || ""}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Varun Teja / Adarsh"
                  required
                  className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Position / Role</label>
                  <Select
                    value={formState.position || "member"}
                    onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl bg-[#050208]"
                  >
                    <option value="president" className="bg-[#050208]">President</option>
                    <option value="vice_president" className="bg-[#050208]">Vice President</option>
                    <option value="general_secretary" className="bg-[#050208]">General Secretary</option>
                    <option value="joint_secretary" className="bg-[#050208]">Joint Secretary</option>
                    <option value="events_head" className="bg-[#050208]">Head of Events &amp; Doc</option>
                    <option value="pr_head" className="bg-[#050208]">Head of Social Media &amp; PR</option>
                    <option value="design_head" className="bg-[#050208]">Head of Design</option>
                    <option value="post_processing_head" className="bg-[#050208]">Head of Post Processing</option>
                    <option value="faculty_coordinator" className="bg-[#050208]">Faculty Coordinator</option>
                    <option value="senior_coordinator" className="bg-[#050208]">Senior Coordinator</option>
                    <option value="junior_coordinator" className="bg-[#050208]">Junior Coordinator</option>
                    <option value="member" className="bg-[#050208]">General Member</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-white/60 font-semibold mb-1">Generation / Year</label>
                  <Select
                    value={formState.year || "12th Gen"}
                    onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl bg-[#050208]"
                  >
                    <option value="12th Gen" className="bg-[#050208]">12th Gen (Active)</option>
                    <option value="11th Gen" className="bg-[#050208]">11th Gen</option>
                    <option value="10th Gen" className="bg-[#050208]">10th Gen</option>
                    <option value="9th Gen" className="bg-[#050208]">9th Gen</option>
                    <option value="Faculty Coordinator" className="bg-[#050208]">Faculty Coordinator</option>
                    <option value="1st year" className="bg-[#050208]">1st Year</option>
                    <option value="2nd year" className="bg-[#050208]">2nd Year</option>
                    <option value="3rd year" className="bg-[#050208]">3rd Year</option>
                    <option value="4th year" className="bg-[#050208]">4th Year</option>
                    <option value="Alumni" className="bg-[#050208]">Alumni</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Department</label>
                  <Select
                    value={formState.department || "CPC"}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl bg-[#050208]"
                  >
                    <option value="CPC" className="bg-[#050208]">CPC Core</option>
                    <option value="CSE" className="bg-[#050208]">CSE</option>
                    <option value="ECE" className="bg-[#050208]">ECE</option>
                    <option value="IT" className="bg-[#050208]">IT</option>
                    <option value="AI&DS" className="bg-[#050208]">AI&amp;DS</option>
                    <option value="EEE" className="bg-[#050208]">EEE</option>
                    <option value="Mechanical" className="bg-[#050208]">Mechanical</option>
                    <option value="Civil" className="bg-[#050208]">Civil</option>
                    <option value="Biotech" className="bg-[#050208]">Biotech</option>
                    <option value="Events" className="bg-[#050208]">Events Team</option>
                    <option value="PR" className="bg-[#050208]">PR Team</option>
                    <option value="Design" className="bg-[#050208]">Design Team</option>
                    <option value="Post Processing" className="bg-[#050208]">Post Processing Team</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-white/60 font-semibold mb-1">Status</label>
                  <Select
                    value={formState.status || "active"}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as "active" | "inactive" | "alumni" })}
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl bg-[#050208]"
                  >
                    <option value="active" className="bg-[#050208]">Active Member</option>
                    <option value="alumni" className="bg-[#050208]">Alumni</option>
                    <option value="inactive" className="bg-[#050208]">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-semibold mb-1">Email</label>
                  <Input
                    type="email"
                    value={formState.email || ""}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="email@cbitphotoclub.in"
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-white/60 font-semibold mb-1">Phone</label>
                  <Input
                    value={formState.phone || ""}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="glass text-white border-purple-500/20 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_core"
                  checked={formState.is_core_committee ?? true}
                  onChange={(e) => setFormState({ ...formState, is_core_committee: e.target.checked })}
                  className="rounded border-purple-500/30 bg-[#050208] text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="is_core" className="text-xs text-white/80 font-medium cursor-pointer">
                  Core Committee Member (Access to Management)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-purple-500/20">
                {editingMember ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(editingMember.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs rounded-xl"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeDrawer}
                    className="text-xs text-white/60 hover:text-white glass rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    size="sm"
                    className="btn-primary-glow text-white font-bold text-xs rounded-xl px-5"
                  >
                    {isPending ? "Saving..." : isCreating ? "Create Member" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
