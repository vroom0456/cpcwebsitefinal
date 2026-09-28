"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { memberFormSchema, type MemberFormValues } from "@/lib/validators/member-form";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

function toSkillsArray(skills?: string) {
  return (skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createMember(values: MemberFormValues) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) throw new Error(auth.message);

  const parsed = memberFormSchema.parse(values);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .insert({
      ...parsed,
      email: parsed.email || null,
      phone: parsed.phone || null,
      department: parsed.department || null,
      year: parsed.year || null,
      joined_club: parsed.joined_club || null,
      profile_photo_url: parsed.profile_photo_url || null,
      skills: toSkillsArray(parsed.skills),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${data.id}/edit`);
}

export async function updateMember(memberId: string, values: MemberFormValues) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) throw new Error(auth.message);

  const parsed = memberFormSchema.parse(values);
  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({
      ...parsed,
      email: parsed.email || null,
      phone: parsed.phone || null,
      department: parsed.department || null,
      year: parsed.year || null,
      joined_club: parsed.joined_club || null,
      profile_photo_url: parsed.profile_photo_url || null,
      skills: toSkillsArray(parsed.skills),
    })
    .eq("id", memberId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${memberId}/edit`);
}

export async function deleteMember(memberId: string) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) throw new Error(auth.message);

  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
}
