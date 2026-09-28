"use client";

import { useState, useTransition, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  ZoomIn,
  Edit3,
  X,
  Sparkles,
  Settings,
  Check,
  CheckCircle2,
  Save,
  ChevronDown,
  Users,
  Crown,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn, getPhotoDisplayUrl } from "@/lib/utils";
import {
  setPhotoPublished,
  setBatchPhotosPublished,
  deletePhoto,
  setCoverFromPhoto,
  setPhotoTagAction,
} from "@/lib/actions/photos.actions";
import { updateEvent, deleteEvent } from "@/lib/actions/events.actions";
import PhotoLightbox from "@/components/public/photo-lightbox";
import type { Photo, Event } from "@/types/database";
import { Crop } from "lucide-react";
import { CoverCropperModal } from "@/components/admin/cover-cropper-modal";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function GalleryManager({
  eventId,
  event: initialEvent,
  photos: initial,
  isAdmin,
}: {
  eventId: string;
  event?: any;
  photos: Photo[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [eventData, setEventData] = useState<any>(initialEvent || {});

  // Sync props from server revalidation
  useEffect(() => {
    setPhotos(initial);
  }, [initial]);

  useEffect(() => {
    if (initialEvent) setEventData(initialEvent);
  }, [initialEvent]);

  const [showQuickEditor, setShowQuickEditor] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "cover" | "group" | "chief">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [eventFormMsg, setEventFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  // formKey forces the Quick Editor form to remount after each save,
  // so defaultValue props reflect the newly-saved data immediately
  const [formKey, setFormKey] = useState(0);

  // Cover Cropper Modal State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperPhotoUrl, setCropperPhotoUrl] = useState<string>("");

  function openCropper(url?: string) {
    const targetUrl = url || eventData.cover_photo_url || (photos[0] ? getPhotoDisplayUrl(photos[0]) : "");
    if (!targetUrl) {
      setEventFormMsg({ type: "error", text: "No photo available to crop" });
      return;
    }
    setCropperPhotoUrl(targetUrl);
    setCropperOpen(true);
  }

  function toggleGroupPhoto(photo: Photo) {
    const currentVal = Boolean(photo.is_group_photo || (photo.exif && photo.exif.is_group_photo));
    const next = !currentVal;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, is_group_photo: next, exif: { ...(p.exif || {}), is_group_photo: next } } : p))
    );

    startTransition(async () => {
      await setPhotoTagAction(photo.id, eventId, "is_group_photo", next);
    });
  }

  function toggleChiefGuest(photo: Photo) {
    const currentVal = Boolean(photo.is_chief_guest || (photo.exif && photo.exif.is_chief_guest));
    const next = !currentVal;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, is_chief_guest: next, exif: { ...(p.exif || {}), is_chief_guest: next } } : p))
    );

    startTransition(async () => {
      await setPhotoTagAction(photo.id, eventId, "is_chief_guest", next);
    });
  }

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesSearch =
        search.trim() === "" || p.filename.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "published") return p.is_published;
      if (filter === "draft") return !p.is_published;
      if (filter === "cover") return p.is_cover;
      if (filter === "group") return Boolean(p.is_group_photo || (p.exif && p.exif.is_group_photo));
      if (filter === "chief") return Boolean(p.is_chief_guest || (p.exif && p.exif.is_chief_guest));
      return true;
    });
  }, [photos, search, filter]);

  function togglePublish(photo: Photo) {
    const next = !photo.is_published;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, is_published: next } : p))
    );
    startTransition(async () => {
      await setPhotoPublished(photo.id, eventId, next);
      router.refresh();
    });
  }

  function makeCover(photo: Photo) {
    const displayUrl = getPhotoDisplayUrl(photo);
    setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photo.id })));
    startTransition(async () => {
      await setCoverFromPhoto(eventId, photo.id, displayUrl);
      router.refresh();
    });
  }

  function remove(photo: Photo) {
    if (!confirm(`Are you sure you want to delete ${photo.filename}?`)) return;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    startTransition(async () => {
      await deletePhoto(photo.id, eventId);
      router.refresh();
    });
  }

  function publishAllFiltered(publishState: boolean) {
    const targetIds = filteredPhotos.map((p) => p.id);
    if (targetIds.length === 0) return;

    const idsSet = new Set(targetIds);
    setPhotos((prev) =>
      prev.map((p) => (idsSet.has(p.id) ? { ...p, is_published: publishState } : p))
    );
    startTransition(async () => {
      await setBatchPhotosPublished(targetIds, eventId, publishState);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner with Easy Inline Title Editing ── */}
      <div className="rounded-2xl glass-card border border-purple-500/20 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#C084FC]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C084FC]/80">
                Quick Gallery Controls
              </span>
              {eventFormMsg && (
                <span
                  className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 animate-pulse ${
                    eventFormMsg.type === "success"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-red-500/20 border-red-500/40 text-red-300"
                  }`}
                >
                  <CheckCircle2 size={12} /> {eventFormMsg.text}
                </span>
              )}
            </div>

            {/* Event Name Header */}
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {eventData.title || "Untitled Event"}
            </h2>

            <p className="text-xs text-white/50 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} className="text-[#C084FC]" />
                {eventData.event_date
                  ? new Date(eventData.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : eventData.academic_year || "2025-26"}
              </span>
              <span className="flex items-center gap-1 text-[#C084FC]">
                <Clock size={12} className="text-[#C084FC]" />
                {eventData.timings || "10:00 AM - 5:00 PM"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#C084FC]" />
                {eventData.venue || "CBIT Main Campus"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openCropper()}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer btn-primary-glow text-white shadow-lg"
              title="Crop and position cover photo"
            >
              <Crop size={14} /> Crop Cover Photo
            </button>

            <button
              type="button"
              onClick={() => setShowQuickEditor((v) => !v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                showQuickEditor
                  ? "glass-purple text-[#C084FC] border-purple-500/50"
                  : "glass text-white/70 border-purple-500/20 hover:text-white"
              }`}
            >
              <Settings size={14} /> {showQuickEditor ? "Hide Quick Editor" : "Quick Edit Event Details"}
              <ChevronDown size={12} className={cn("transition-transform", showQuickEditor && "rotate-180")} />
            </button>

            <button
              type="button"
              onClick={async () => {
                if (confirm(`Are you sure you want to delete "${eventData.title || "this event"}"? This action cannot be undone.`)) {
                  await deleteEvent(eventId);
                  window.location.href = "/admin/events";
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-red-950/70 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white shadow-lg"
              title="Delete this event"
            >
              <Trash2 size={14} /> Delete Event
            </button>
          </div>
        </div>

        {/* ── Quick Editor Drawer (Comprehensive Instant Inputs for Name, Date, Timings, Venue, Year, Dept, Drive ID) ── */}
        {showQuickEditor && (
          <form
            key={formKey}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const title = (formData.get("title") as string) || eventData.title || "";
              const event_date = (formData.get("event_date") as string) || eventData.event_date || "";
              const timings = (formData.get("timings") as string) || eventData.timings || "";
              const venue = (formData.get("venue") as string) || eventData.venue || "";
              const academic_year = (formData.get("academic_year") as string) || eventData.academic_year || "";
              const department = (formData.get("department") as string) || eventData.department || "";
              const category = (formData.get("category") as string) || eventData.category || "";
              const drive_folder_id = (formData.get("drive_folder_id") as string) || eventData.drive_folder_id || "";
              const status = (formData.get("status") as any) || eventData.status || "published";
              const description = (formData.get("description") as string) || eventData.description || "";

              const values = {
                title,
                event_date,
                timings,
                venue,
                academic_year,
                department,
                category,
                drive_folder_id,
                status,
                description,
              };

              setEventData((prev: any) => ({ ...prev, ...values }));
              startTransition(async () => {
                try {
                  await updateEvent(eventId, values as never);
                  setEventFormMsg({ type: "success", text: "Saved! Changes are now live on the main site." });
                  // Increment formKey to remount form with fresh defaultValues
                  setFormKey((k) => k + 1);
                  router.refresh();
                  setTimeout(() => setEventFormMsg(null), 4000);
                } catch (err) {
                  const errorText = err instanceof Error ? err.message : "Error saving details";
                  setEventFormMsg({ type: "error", text: errorText });
                }
              });
            }}
            className="pt-4 border-t border-purple-500/15 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Event Name
                </label>
                <Input
                  name="title"
                  defaultValue={eventData.title || ""}
                  placeholder="Event Name"
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                  <CalendarDays size={12} className="text-[#C084FC]" /> Event Date (Calendar)
                </label>
                <Input
                  type="date"
                  name="event_date"
                  defaultValue={eventData.event_date ? new Date(eventData.event_date).toISOString().split("T")[0] : ""}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[#C084FC]" /> Time Presets (Timings)
                </label>
                <Select
                  name="timings_preset"
                  defaultValue={eventData.timings || "10:00 AM - 5:00 PM"}
                  onChange={(e) => {
                    const val = e.target.value;
                    const inputEl = document.getElementById("quick_timings_input") as HTMLInputElement;
                    if (inputEl && val) inputEl.value = val;
                  }}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 bg-[#050208]"
                >
                  <option value="10:00 AM - 5:00 PM" className="bg-[#050208]">10:00 AM - 5:00 PM (Full Day)</option>
                  <option value="09:30 AM - 04:30 PM" className="bg-[#050208]">9:30 AM - 4:30 PM (Standard College)</option>
                  <option value="09:00 AM - 01:00 PM" className="bg-[#050208]">9:00 AM - 1:00 PM (Morning Session)</option>
                  <option value="02:00 PM - 06:00 PM" className="bg-[#050208]">2:00 PM - 6:00 PM (Afternoon Session)</option>
                  <option value="05:00 PM - 09:00 PM" className="bg-[#050208]">5:00 PM - 9:00 PM (Evening Cultural Fest)</option>
                  <option value="09:00 AM onwards" className="bg-[#050208]">9:00 AM onwards</option>
                  <option value="10:00 AM onwards" className="bg-[#050208]">10:00 AM onwards</option>
                  <option value="Custom" className="bg-[#050208]">Custom Time String...</option>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Exact Timings Text
                </label>
                <Input
                  id="quick_timings_input"
                  name="timings"
                  defaultValue={eventData.timings || "10:00 AM - 5:00 PM"}
                  placeholder="e.g. 10:00 AM - 5:00 PM"
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-[#C084FC]" /> Venue Location
                </label>
                <Select
                  name="venue"
                  defaultValue={eventData.venue || "Open Air Auditorium (OAT)"}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 bg-[#050208]"
                >
                  <option value="Open Air Auditorium (OAT)" className="bg-[#050208]">Open Air Auditorium (OAT)</option>
                  <option value="Main Assembly Hall (Block A)" className="bg-[#050208]">Main Assembly Hall (Block A)</option>
                  <option value="CBIT Sports Complex & Grounds" className="bg-[#050208]">CBIT Sports Complex &amp; Grounds</option>
                  <option value="Block C Seminar Hall" className="bg-[#050208]">Block C Seminar Hall</option>
                  <option value="Library Conference Room" className="bg-[#050208]">Library Conference Room</option>
                  <option value="R&D Building Auditorium" className="bg-[#050208]">R&amp;D Building Auditorium</option>
                  <option value="Placement Cell Seminar Hall" className="bg-[#050208]">Placement Cell Seminar Hall</option>
                  <option value="CBIT Quadrangle" className="bg-[#050208]">CBIT Quadrangle</option>
                  <option value="Off-Campus / Outdoor" className="bg-[#050208]">Off-Campus / Outdoor Location</option>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Academic Year
                </label>
                <Select
                  name="academic_year"
                  defaultValue={eventData.academic_year || "2025-26"}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 bg-[#050208]"
                >
                  <option value="2026-27" className="bg-[#050208]">2026-27 (12th Gen)</option>
                  <option value="2025-26" className="bg-[#050208]">2025-26 (11th Gen)</option>
                  <option value="2024-25" className="bg-[#050208]">2024-25 (10th Gen)</option>
                  <option value="2023-24" className="bg-[#050208]">2023-24 (9th Gen)</option>
                  <option value="2022-23" className="bg-[#050208]">2022-23 (8th Gen)</option>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Department / Club
                </label>
                <Select
                  name="department"
                  defaultValue={eventData.department || "General / Campus-Wide"}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 bg-[#050208]"
                >
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
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Google Drive Folder ID
                </label>
                <Input
                  name="drive_folder_id"
                  defaultValue={eventData.drive_folder_id || ""}
                  placeholder="Drive Folder ID"
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                  Publish Status
                </label>
                <Select
                  name="status"
                  defaultValue={eventData.status || "published"}
                  className="glass text-white text-xs h-9 rounded-lg border-purple-500/30 bg-[#050208]"
                >
                  <option value="published" className="bg-[#050208]">Published (Live)</option>
                  <option value="draft" className="bg-[#050208]">Draft (Hidden)</option>
                  <option value="archived" className="bg-[#050208]">Archived</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-purple-300/80 mb-1">
                About / Event Description
              </label>
              <Input
                name="description"
                defaultValue={eventData.description || ""}
                placeholder="Write a brief overview of this campus event..."
                className="glass text-white text-xs h-9 rounded-lg border-purple-500/30"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                className="btn-primary-glow text-white text-xs font-bold uppercase tracking-wider h-9 px-6 rounded-xl cursor-pointer"
              >
                <Save size={13} className="mr-1.5" /> Save All Event Details
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Control & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9D5EE5]/70" />
          <Input
            placeholder="Search photos by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs glass text-white placeholder:text-white/35 rounded-xl border-purple-500/20 h-10"
          />
        </div>

        {/* Filter Pills & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl glass p-1 text-xs border border-purple-500/20">
            {(["all", "published", "draft", "cover", "group", "chief"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={cn(
                  "rounded-lg px-3 py-1 font-bold capitalize transition-all cursor-pointer",
                  filter === mode
                    ? "glass-purple text-white shadow-sm"
                    : "text-white/40 hover:text-white"
                )}
              >
                {mode === "group" ? "Group Photos" : mode === "chief" ? "Chief Guest" : mode}
              </button>
            ))}
          </div>

          {isAdmin && photos.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => publishAllFiltered(true)}
                title="Publish all filtered photos"
                className="text-xs font-bold glass text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 h-9 rounded-xl cursor-pointer"
              >
                <CheckSquare className="mr-1.5 h-3.5 w-3.5" /> Publish All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => publishAllFiltered(false)}
                title="Unpublish all filtered photos"
                className="text-xs font-bold glass text-amber-300 border-amber-500/30 hover:bg-amber-500/20 h-9 rounded-xl cursor-pointer"
              >
                <Square className="mr-1.5 h-3.5 w-3.5" /> Hide All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Counter */}
      <p className="text-xs font-mono text-white/40">
        Showing {filteredPhotos.length} of {photos.length} photos
      </p>

      {photos.length === 0 ? (
        <div className="rounded-3xl glass-card border border-purple-500/20 p-12 text-center space-y-3">
          <Sparkles size={28} className="mx-auto text-[#C084FC]/60" />
          <p className="text-xs text-white/50 max-w-md mx-auto">
            No photos synced for this event yet. Sync this event&apos;s Google Drive folder from the Drive Sync tab to pull captures automatically.
          </p>
        </div>
      ) : (
        /* Fluid CSS Masonry Grid Matching Main Public Site */
        <div
          className={cn(
            "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4",
            isPending && "opacity-90"
          )}
        >
          {filteredPhotos.map((photo, index) => {
            const displayUrl = getPhotoDisplayUrl(photo);
            const width = photo.width ?? 1200;
            const height = photo.height ?? 800;
            const aspectRatio = `${width} / ${height}`;

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * 0.05 }}
              >
                <div
                  className={cn(
                    "group relative break-inside-avoid overflow-hidden rounded-2xl bg-[#0B0515] border border-white/[0.08] transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_20px_50px_rgba(79,22,142,0.35)] cursor-pointer",
                    !photo.is_published && "opacity-60 grayscale-[30%]"
                  )}
                  style={{ aspectRatio }}
                  onClick={() => setLightboxIndex(index)}
                >
                  <Image
                  src={displayUrl}
                  alt={photo.filename}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.srcset = "";
                    if (photo.drive_file_id && !target.src.includes("/api/drive/photo/")) {
                      target.src = `/api/drive/photo/${photo.drive_file_id}`;
                    } else if (photo.drive_file_id && !target.src.includes("drive.google.com/thumbnail")) {
                      target.src = `https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=s800`;
                    } else {
                      target.src = "/images/placeholder-event.jpg";
                    }
                  }}
                />

                {/* Status Badges Top Left */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  {photo.is_cover && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 text-[9px] font-bold text-amber-300 shadow-md">
                      <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" /> Cover
                    </span>
                  )}
                  {Boolean(photo.is_group_photo || (photo.exif && photo.exif.is_group_photo)) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-500/40 px-2.5 py-0.5 text-[9px] font-bold text-purple-300 shadow-md">
                      <Users className="h-2.5 w-2.5 text-purple-300" /> Group Photo
                    </span>
                  )}
                  {Boolean(photo.is_chief_guest || (photo.exif && photo.exif.is_chief_guest)) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 text-[9px] font-bold text-amber-300 shadow-md">
                      <Crown className="h-2.5 w-2.5 text-amber-300" /> Chief Guest
                    </span>
                  )}
                  {!photo.is_published && (
                    <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-white/60">
                      Draft
                    </span>
                  )}
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050208]/90 via-[#050208]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      className="rounded-xl p-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:border-purple-500/40 transition-colors cursor-pointer"
                      title="Inspect Fullscreen"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-white/90 truncate font-semibold">{photo.filename}</p>

                    {isAdmin && (
                      <div
                        className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => togglePublish(photo)}
                          className={cn(
                            "flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold transition-all cursor-pointer",
                            photo.is_published
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md"
                              : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10 backdrop-blur-md"
                          )}
                          title={photo.is_published ? "Unpublish photo" : "Publish photo"}
                        >
                          {photo.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                          {photo.is_published ? "Live" : "Hidden"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleGroupPhoto(photo)}
                          className={cn(
                            "rounded-xl px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border backdrop-blur-md",
                            (photo.is_group_photo || (photo.exif && photo.exif.is_group_photo))
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-black/30 text-white/40 hover:text-white border-white/10"
                          )}
                          title="Tag as Group Photo"
                        >
                          <Users size={11} />
                          Group
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleChiefGuest(photo)}
                          className={cn(
                            "rounded-xl px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border backdrop-blur-md",
                            (photo.is_chief_guest || (photo.exif && photo.exif.is_chief_guest))
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-black/30 text-white/40 hover:text-white border-white/10"
                          )}
                          title="Tag as Chief Guest Photo"
                        >
                          <Crown size={11} />
                          Chief
                        </button>

                        <button
                          type="button"
                          onClick={() => openCropper(getPhotoDisplayUrl(photo))}
                          className="rounded-xl p-1.5 transition-all cursor-pointer border border-white/10 bg-black/30 backdrop-blur-md text-white/40 hover:text-purple-300 hover:border-purple-500/40"
                          title="Crop & Set as Cover Photo"
                        >
                          <Crop size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => makeCover(photo)}
                          className={cn(
                            "rounded-xl p-1.5 transition-all cursor-pointer border border-white/10 bg-black/30 backdrop-blur-md",
                            photo.is_cover
                              ? "text-amber-300 border-amber-500/40"
                              : "text-white/40 hover:text-amber-300"
                          )}
                          title="Set as Cover Photo"
                        >
                          <Star size={13} className={photo.is_cover ? "fill-amber-300" : ""} />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(photo)}
                          className="rounded-xl p-1.5 text-white/40 hover:text-red-400 border border-white/10 bg-black/30 backdrop-blur-md transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* Fullsite Lightbox Modal */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          eventTitle={eventData.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Cover Cropper & Custom Aspect Ratio Modal */}
      <CoverCropperModal
        isOpen={cropperOpen}
        photoUrl={cropperPhotoUrl}
        eventId={eventId}
        onClose={() => setCropperOpen(false)}
        onSaveSuccess={(newCoverUrl) => {
          setEventData((prev: any) => ({ ...prev, cover_photo_url: newCoverUrl }));
          setEventFormMsg({ type: "success", text: "Cover photo updated! Changes are live." });
          router.refresh();
          setTimeout(() => setEventFormMsg(null), 4000);
        }}
      />
    </div>
  );
}
