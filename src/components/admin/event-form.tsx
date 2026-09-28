"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, type EventFormValues } from "@/lib/validators/event-form";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/admin/form-field";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events.actions";
import type { Event } from "@/types/database";
import { CheckCircle2, Trash2 } from "lucide-react";

export function EventForm({
  event,
  submitLabel,
}: {
  event?: Event;
  submitLabel: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(event));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      description: event?.description ?? "",
      category: event?.category ?? "",
      department: event?.department ?? "",
      venue: event?.venue ?? "",
      academic_year: event?.academic_year ?? "",
      event_date: event?.event_date ?? "",
      drive_folder_id: event?.drive_folder_id ?? "",
      status: event?.status ?? "draft",
    },
  });

  async function submit(values: EventFormValues) {
    setServerError(null);
    setSuccessMsg(null);
    try {
      if (!values.slug || values.slug.trim() === "") {
        values.slug = slugify(values.title);
      }

      if (event) {
        await updateEvent(event.id, values);
        setSuccessMsg("Event updated successfully!");
        router.refresh();
      } else {
        await createEvent(values);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong while saving");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-3xl space-y-6">
      {serverError && (
        <p className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-xs font-semibold text-red-300">
          {serverError}
        </p>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          {...register("title")}
          onChange={(e) => {
            register("title").onChange(e);
            if (!slugTouched) setValue("slug", slugify(e.target.value));
          }}
          className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl focus:border-purple-500/40"
        />
      </FormField>

      <FormField label="Slug" htmlFor="slug" error={errors.slug?.message} hint="Used in public URLs">
        <Input
          id="slug"
          {...register("slug")}
          onChange={(e) => {
            setSlugTouched(true);
            register("slug").onChange(e);
          }}
          className="glass text-white border-purple-500/20 text-xs font-mono h-11 rounded-xl focus:border-purple-500/40"
        />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="w-full rounded-xl border border-purple-500/20 glass px-4 py-3 text-xs text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Department" htmlFor="department" error={errors.department?.message}>
          <Select id="department" {...register("department")} className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl bg-[#050208]">
            <option value="" className="bg-[#050208]">Select Department</option>
            <option value="General / Campus-Wide" className="bg-[#050208]">General / Campus-Wide</option>
            <option value="CSE" className="bg-[#050208]">Computer Science &amp; Engineering (CSE)</option>
            <option value="ECE" className="bg-[#050208]">Electronics &amp; Communication (ECE)</option>
            <option value="IT" className="bg-[#050208]">Information Technology (IT)</option>
            <option value="AI&DS" className="bg-[#050208]">Artificial Intelligence &amp; Data Science (AI&amp;DS)</option>
            <option value="EEE" className="bg-[#050208]">Electrical &amp; Electronics (EEE)</option>
            <option value="Mechanical" className="bg-[#050208]">Mechanical Engineering</option>
            <option value="Civil" className="bg-[#050208]">Civil Engineering</option>
            <option value="Biotech" className="bg-[#050208]">Biotechnology</option>
            <option value="MBA/MCA" className="bg-[#050208]">MBA / MCA</option>
          </Select>
        </FormField>
        <FormField label="Venue" htmlFor="venue" error={errors.venue?.message}>
          <Select id="venue" {...register("venue")} className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl bg-[#050208]">
            <option value="" className="bg-[#050208]">Select Venue</option>
            <option value="Main Assembly Hall (Block A)" className="bg-[#050208]">Main Assembly Hall (Block A)</option>
            <option value="Open Air Auditorium (OAT)" className="bg-[#050208]">Open Air Auditorium (OAT)</option>
            <option value="CBIT Sports Complex &amp; Grounds" className="bg-[#050208]">CBIT Sports Complex &amp; Grounds</option>
            <option value="Block C Seminar Hall" className="bg-[#050208]">Block C Seminar Hall</option>
            <option value="Library Conference Room" className="bg-[#050208]">Library Conference Room</option>
            <option value="R&amp;D Building Auditorium" className="bg-[#050208]">R&amp;D Building Auditorium</option>
            <option value="Placement Cell Seminar Hall" className="bg-[#050208]">Placement Cell Seminar Hall</option>
            <option value="CBIT Quadrangle" className="bg-[#050208]">CBIT Quadrangle</option>
            <option value="Off-Campus / Outdoor" className="bg-[#050208]">Off-Campus / Outdoor Location</option>
          </Select>
        </FormField>
        <FormField
          label="Academic year"
          htmlFor="academic_year"
          error={errors.academic_year?.message}
          hint="e.g. 2026-27"
        >
          <Select id="academic_year" {...register("academic_year")} className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl bg-[#050208]">
            <option value="" className="bg-[#050208]">Select Academic Year</option>
            <option value="2026-27" className="bg-[#050208]">2026-27 (12th Gen)</option>
            <option value="2025-26" className="bg-[#050208]">2025-26 (11th Gen)</option>
            <option value="2024-25" className="bg-[#050208]">2024-25 (10th Gen)</option>
            <option value="2023-24" className="bg-[#050208]">2023-24 (9th Gen)</option>
            <option value="2022-23" className="bg-[#050208]">2022-23 (8th Gen)</option>
          </Select>
        </FormField>
        <FormField label="Event date (Calendar)" htmlFor="event_date" error={errors.event_date?.message}>
          <Input id="event_date" type="date" {...register("event_date")} className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl cursor-pointer" />
        </FormField>
        <FormField label="Timings (Preset & Custom)" htmlFor="timings" error={errors.timings?.message} hint="Select preset or type custom timings">
          <div className="space-y-2">
            <Select
              onChange={(e) => {
                if (e.target.value) setValue("timings", e.target.value);
              }}
              className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl bg-[#050208]"
            >
              <option value="" className="bg-[#050208]">Select Quick Time Preset...</option>
              <option value="10:00 AM - 5:00 PM" className="bg-[#050208]">10:00 AM - 5:00 PM (Full Day)</option>
              <option value="09:30 AM - 04:30 PM" className="bg-[#050208]">9:30 AM - 4:30 PM (College Hours)</option>
              <option value="09:00 AM - 01:00 PM" className="bg-[#050208]">9:00 AM - 1:00 PM (Morning Session)</option>
              <option value="02:00 PM - 06:00 PM" className="bg-[#050208]">2:00 PM - 6:00 PM (Afternoon Session)</option>
              <option value="05:00 PM - 09:00 PM" className="bg-[#050208]">5:00 PM - 9:00 PM (Evening Fest)</option>
              <option value="09:00 AM onwards" className="bg-[#050208]">9:00 AM onwards</option>
              <option value="10:00 AM onwards" className="bg-[#050208]">10:00 AM onwards</option>
            </Select>
            <Input
              id="timings"
              placeholder="e.g. 10:00 AM - 5:00 PM"
              {...register("timings")}
              className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl focus:border-purple-500/40"
            />
          </div>
        </FormField>
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register("status")} className="glass text-white border-purple-500/20 text-xs h-11 rounded-xl bg-[#050208]">
            <option value="draft" className="bg-[#050208]">Draft (Hidden)</option>
            <option value="published" className="bg-[#050208]">Published (Live)</option>
            <option value="archived" className="bg-[#050208]">Archived</option>
          </Select>
        </FormField>
      </div>

      <FormField
        label="Google Drive folder ID"
        htmlFor="drive_folder_id"
        error={errors.drive_folder_id?.message}
        hint="From the Drive folder URL — used by the sync service"
      >
        <Input id="drive_folder_id" {...register("drive_folder_id")} className="glass text-white border-purple-500/20 text-xs font-mono h-11 rounded-xl" />
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-glow text-white font-bold text-xs uppercase tracking-widest px-6 h-11 rounded-xl cursor-pointer"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>

        {event && (
          <button
            type="button"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) {
                await deleteEvent(event.id);
                router.push("/admin/events");
              }
            }}
            className="flex items-center gap-2 px-5 h-11 rounded-xl bg-red-950/70 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <Trash2 size={14} />
            Delete Event
          </button>
        )}
      </div>
    </form>
  );
}
