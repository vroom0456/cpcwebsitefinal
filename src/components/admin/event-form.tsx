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
import { CheckCircle2, Trash2, Building2, MapPin, Calendar, Clock, HardDrive, Tag } from "lucide-react";
import { CBIT_CAMPUS_VENUES, getAllCBITClubsList } from "@/lib/data/cbit-clubs";

const CBIT_ACADEMIC_DEPARTMENTS = [
  "General / Campus-Wide",
  "CSE Department",
  "IT Department",
  "ECE Department",
  "EEE Department",
  "Mechanical Engineering Department",
  "Civil Engineering Department",
  "Chemical Engineering Department",
  "Biotechnology Department",
  "Artificial Intelligence & Data Science (AI&DS)",
  "Artificial Intelligence & Machine Learning (AIML)",
  "School of Management Studies (SMS - MBA)",
  "MCA Department",
  "Physics / Chemistry / Mathematics (H&S)",
];

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

  // Custom values for custom club / custom venue
  const allClubsFlat = getAllCBITClubsList().flatMap((g) => g.options);
  const initialIsCustomClub =
    Boolean(event?.organizing_club) &&
    event?.organizing_club !== "featured_home" &&
    !allClubsFlat.includes(event?.organizing_club || "");
  const [isCustomClub, setIsCustomClub] = useState(initialIsCustomClub);
  const [customClubText, setCustomClubText] = useState(initialIsCustomClub ? event?.organizing_club || "" : "");

  const initialIsCustomVenue =
    Boolean(event?.venue) &&
    !CBIT_CAMPUS_VENUES.includes(event?.venue as any);
  const [isCustomVenue, setIsCustomVenue] = useState(initialIsCustomVenue);
  const [customVenueText, setCustomVenueText] = useState(initialIsCustomVenue ? event?.venue || "" : "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      description: event?.description ?? "",
      category: event?.category ?? "",
      organizing_club: event?.organizing_club ?? "",
      department: event?.department ?? "",
      venue: event?.venue ?? "",
      academic_year: event?.academic_year ?? "2026-27",
      event_date: event?.event_date ?? "",
      timings: event?.timings ?? "",
      drive_folder_id: event?.drive_folder_id ?? "",
      status: event?.status ?? "draft",
    },
  });

  const selectedClub = watch("organizing_club");
  const selectedVenue = watch("venue");

  async function submit(values: EventFormValues) {
    setServerError(null);
    setSuccessMsg(null);
    try {
      if (!values.slug || values.slug.trim() === "") {
        values.slug = slugify(values.title);
      }

      // Handle custom club
      if (isCustomClub && customClubText.trim()) {
        values.organizing_club = customClubText.trim();
      }

      // Handle custom venue
      if (isCustomVenue && customVenueText.trim()) {
        values.venue = customVenueText.trim();
      }

      if (event) {
        await updateEvent(event.id, values);
        setSuccessMsg("Event details updated successfully!");
        router.refresh();
      } else {
        await createEvent(values);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong while saving");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-4xl space-y-6">
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

      {/* Title & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Event Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            {...register("title")}
            onChange={(e) => {
              register("title").onChange(e);
              if (!slugTouched) setValue("slug", slugify(e.target.value));
            }}
            placeholder="e.g. Sudhee 2026, Shruthi Annual Fest, Robotics Hackathon"
            className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl focus:border-purple-500/40"
          />
        </FormField>

        <FormField label="Public URL Slug" htmlFor="slug" error={errors.slug?.message} hint="Used in public URLs (/gallery/...)">
          <Input
            id="slug"
            {...register("slug")}
            onChange={(e) => {
              setSlugTouched(true);
              register("slug").onChange(e);
            }}
            placeholder="e.g. sudhee-2026"
            className="glass text-white border-purple-500/20 text-xs sm:text-sm font-mono h-11 rounded-xl focus:border-purple-500/40"
          />
        </FormField>
      </div>

      {/* Description */}
      <FormField label="Description / Summary" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder="Brief summary of the event highlights, key moments, and activities..."
          className="w-full rounded-xl border border-purple-500/20 glass px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
        />
      </FormField>

      {/* Organizing Club & Academic Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Organizing Club */}
        <FormField label="Organising Club / Body" htmlFor="organizing_club" error={errors.organizing_club?.message}>
          <div className="space-y-2">
            <Select
              id="organizing_club"
              {...register("organizing_club")}
              onChange={(e) => {
                register("organizing_club").onChange(e);
                if (e.target.value === "OTHER_CUSTOM") {
                  setIsCustomClub(true);
                } else {
                  setIsCustomClub(false);
                }
              }}
              value={isCustomClub ? "OTHER_CUSTOM" : selectedClub}
              className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl bg-[#050208]"
            >
              <option value="" className="bg-[#050208]">Select Organising Club (All)</option>
              {getAllCBITClubsList().map((group) => (
                <optgroup key={group.group} label={group.group} className="bg-[#12081f] text-[#C084FC] font-semibold">
                  {group.options.map((c) => (
                    <option key={c} value={c} className="bg-[#050208] text-white font-normal">
                      {c}
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup label="Custom" className="bg-[#12081f] text-[#C084FC] font-semibold">
                <option value="OTHER_CUSTOM" className="bg-[#050208] text-white">
                  Other Club / External Body (Enter Custom)
                </option>
              </optgroup>
            </Select>

            {isCustomClub && (
              <Input
                placeholder="Enter custom organising club name..."
                value={customClubText}
                onChange={(e) => {
                  setCustomClubText(e.target.value);
                  setValue("organizing_club", e.target.value);
                }}
                className="glass text-white border-[#C084FC]/50 text-xs h-10 rounded-xl"
              />
            )}
          </div>
        </FormField>

        {/* Academic Department */}
        <FormField label="Academic Department" htmlFor="department" error={errors.department?.message}>
          <Select id="department" {...register("department")} className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl bg-[#050208]">
            <option value="" className="bg-[#050208]">Select Academic Department</option>
            {CBIT_ACADEMIC_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-[#050208]">
                {dept}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {/* Venue & Academic Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campus Venue */}
        <FormField label="Campus Venue" htmlFor="venue" error={errors.venue?.message}>
          <div className="space-y-2">
            <Select
              id="venue"
              {...register("venue")}
              onChange={(e) => {
                register("venue").onChange(e);
                if (e.target.value === "OTHER_CUSTOM") {
                  setIsCustomVenue(true);
                } else {
                  setIsCustomVenue(false);
                }
              }}
              value={isCustomVenue ? "OTHER_CUSTOM" : selectedVenue}
              className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl bg-[#050208]"
            >
              <option value="" className="bg-[#050208]">Select Campus Venue</option>
              {CBIT_CAMPUS_VENUES.map((v) => (
                <option key={v} value={v} className="bg-[#050208]">
                  {v}
                </option>
              ))}
              <option value="OTHER_CUSTOM" className="bg-[#050208]">
                Other Campus Location / Stage (Enter Custom)
              </option>
            </Select>

            {isCustomVenue && (
              <Input
                placeholder="Enter custom campus location or stage..."
                value={customVenueText}
                onChange={(e) => {
                  setCustomVenueText(e.target.value);
                  setValue("venue", e.target.value);
                }}
                className="glass text-white border-[#C084FC]/50 text-xs h-10 rounded-xl"
              />
            )}
          </div>
        </FormField>

        {/* Academic Year */}
        <FormField
          label="Academic Year"
          htmlFor="academic_year"
          error={errors.academic_year?.message}
          hint="e.g. 2026-27"
        >
          <Select id="academic_year" {...register("academic_year")} className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl bg-[#050208]">
            <option value="2026-27" className="bg-[#050208]">2026-27 (12th Gen - Current)</option>
            <option value="2025-26" className="bg-[#050208]">2025-26 (11th Gen)</option>
            <option value="2024-25" className="bg-[#050208]">2024-25 (10th Gen)</option>
            <option value="2023-24" className="bg-[#050208]">2023-24 (9th Gen)</option>
            <option value="2022-23" className="bg-[#050208]">2022-23 (8th Gen)</option>
          </Select>
        </FormField>
      </div>

      {/* Date, Timings & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Event Date */}
        <FormField label="Event Date" htmlFor="event_date" error={errors.event_date?.message}>
          <Input id="event_date" type="date" {...register("event_date")} className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl cursor-pointer" />
        </FormField>

        {/* Timings */}
        <FormField label="Timings" htmlFor="timings" error={errors.timings?.message} hint="Select preset or type custom">
          <div className="space-y-1.5">
            <Select
              onChange={(e) => {
                if (e.target.value) setValue("timings", e.target.value);
              }}
              className="glass text-white border-purple-500/20 text-[11px] h-7 rounded-lg bg-[#050208]"
            >
              <option value="" className="bg-[#050208]">Select quick preset…</option>
              <option value="10:00 AM - 5:00 PM" className="bg-[#050208]">10:00 AM - 5:00 PM (Full Day)</option>
              <option value="09:30 AM - 04:30 PM" className="bg-[#050208]">9:30 AM - 4:30 PM (College Hours)</option>
              <option value="09:00 AM - 01:00 PM" className="bg-[#050208]">9:00 AM - 1:00 PM (Morning Session)</option>
              <option value="02:00 PM - 06:00 PM" className="bg-[#050208]">2:00 PM - 6:00 PM (Afternoon Session)</option>
              <option value="05:00 PM - 09:00 PM" className="bg-[#050208]">5:00 PM - 9:00 PM (Evening Fest)</option>
            </Select>
            <Input
              id="timings"
              placeholder="e.g. 10:00 AM - 5:00 PM"
              {...register("timings")}
              className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl focus:border-purple-500/40"
            />
          </div>
        </FormField>

        {/* Status */}
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register("status")} className="glass text-white border-purple-500/20 text-xs sm:text-sm h-11 rounded-xl bg-[#050208]">
            <option value="published" className="bg-[#050208]">Published (Live)</option>
            <option value="draft" className="bg-[#050208]">Draft (Hidden)</option>
            <option value="archived" className="bg-[#050208]">Archived</option>
          </Select>
        </FormField>
      </div>

      {/* Drive Folder ID */}
      <FormField
        label="Google Drive Folder URL / ID"
        htmlFor="drive_folder_id"
        error={errors.drive_folder_id?.message}
        hint="Paste either folder link or folder ID"
      >
        <Input
          id="drive_folder_id"
          {...register("drive_folder_id")}
          placeholder="https://drive.google.com/drive/folders/1ABC... or 1ABC..."
          className="glass text-white border-purple-500/20 text-xs font-mono h-11 rounded-xl"
        />
      </FormField>

      {/* Save Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-glow text-white font-bold text-xs uppercase tracking-widest px-8 h-12 rounded-xl cursor-pointer"
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
