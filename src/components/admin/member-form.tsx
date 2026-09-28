"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberFormSchema, type MemberFormValues } from "@/lib/validators/member-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/admin/form-field";
import { createMember, updateMember } from "@/lib/actions/members.actions";
import type { Member } from "@/types/database";
import { CheckCircle2 } from "lucide-react";

export function MemberForm({
  member,
  submitLabel,
}: {
  member?: Member;
  submitLabel: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: member?.name ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      department: member?.department ?? "",
      year: member?.year ?? "",
      joined_club: member?.joined_club ?? "",
      status: member?.status ?? "active",
      position: member?.position ?? "member",
      is_core_committee: member?.is_core_committee ?? false,
      skills: member?.skills?.join(", ") ?? "",
      profile_photo_url: member?.profile_photo_url ?? "",
    },
  });

  async function submit(values: MemberFormValues) {
    setServerError(null);
    setSuccessMsg(null);
    try {
      if (member) {
        await updateMember(member.id, values);
        setSuccessMsg("Member updated successfully!");
        router.refresh();
      } else {
        await createMember(values);
        setSuccessMsg("Member created successfully!");
        router.push("/admin/team");
        router.refresh();
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-2xl space-y-5">
      {serverError && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{serverError}</p>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register("phone")} />
        </FormField>
        <FormField label="Department" htmlFor="department" error={errors.department?.message}>
          <Select id="department" {...register("department")}>
            <option value="">Select Department</option>
            <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
            <option value="ECE">Electronics &amp; Communication (ECE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="AI&DS">Artificial Intelligence &amp; Data Science (AI&amp;DS)</option>
            <option value="EEE">Electrical &amp; Electronics (EEE)</option>
            <option value="Mechanical">Mechanical Engineering</option>
            <option value="Civil">Civil Engineering</option>
            <option value="Biotech">Biotechnology</option>
            <option value="MBA/MCA">MBA / MCA</option>
            <option value="Other">Other / General</option>
          </Select>
        </FormField>
        <FormField label="Year / Generation" htmlFor="year" error={errors.year?.message}>
          <Select id="year" {...register("year")}>
            <option value="">Select Academic Year / Generation</option>
            <option value="12th Gen">12th Gen (2026-27 Active)</option>
            <option value="11th Gen">11th Gen (2025-26)</option>
            <option value="10th Gen">10th Gen (2024-25)</option>
            <option value="9th Gen">9th Gen (2023-24)</option>
            <option value="Faculty Coordinator">Faculty Coordinator</option>
            <option value="1st year">1st Year Student</option>
            <option value="2nd year">2nd Year Student</option>
            <option value="3rd year">3rd Year Student</option>
            <option value="4th year">4th Year Student</option>
            <option value="Alumni">Alumni / Graduated</option>
          </Select>
        </FormField>
        <FormField label="Joined club" htmlFor="joined_club" error={errors.joined_club?.message}>
          <Input id="joined_club" type="date" {...register("joined_club")} />
        </FormField>
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </Select>
        </FormField>
        <FormField label="Position / Role" htmlFor="position" error={errors.position?.message}>
          <Select id="position" {...register("position")}>
            <option value="member">Member</option>
            <option value="junior_coordinator">Junior Coordinator</option>
            <option value="senior_coordinator">Senior Coordinator</option>
            <option value="president">President</option>
            <option value="vice_president">Vice President</option>
            <option value="general_secretary">General Secretary</option>
            <option value="joint_secretary">Joint Secretary</option>
            <option value="events_head">Head of Events &amp; Documentation</option>
            <option value="pr_head">Head of Social Media &amp; PR</option>
            <option value="design_head">Head of Design</option>
            <option value="post_processing_head">Head of Post Processing</option>
            <option value="faculty_coordinator">Faculty Coordinator</option>
          </Select>
        </FormField>
        <FormField
          label="Profile photo URL"
          htmlFor="profile_photo_url"
          error={errors.profile_photo_url?.message}
        >
          <Input id="profile_photo_url" {...register("profile_photo_url")} />
        </FormField>
      </div>

      <FormField
        label="Skills"
        htmlFor="skills"
        error={errors.skills?.message}
        hint="Comma-separated, e.g. Lightroom, Portrait, Drone"
      >
        <Input id="skills" {...register("skills")} />
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_core_committee")} className="h-4 w-4 rounded border-input" />
        Core Committee member (can access the admin dashboard once linked to a login)
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
