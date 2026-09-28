"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Aperture, Expand, Layers, Sparkles, SlidersHorizontal } from "lucide-react";
import type { Photo } from "@/types/database";
import { getPhotoDisplayUrl, cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import dynamic from "next/dynamic";

const PhotoLightbox = dynamic(() => import("@/components/public/photo-lightbox"), {
  ssr: false,
});

const EASE = [0.16, 1, 0.3, 1] as const;



// Seed Portfolio Photos (used if database event has no synced photos yet)
const seedPhotos: Photo[] = [
  {
    id: "portfolio-seed-1",
    event_id: "portfolio",
    drive_file_id: "1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    filename: "Portraits & People/Sanjyy_Portrait.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    full_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    width: 3072,
    height: 3840,
    camera_make: "OnePlus",
    camera_model: "Nord 3 5G",
    lens: "5.59mm f/1.8",
    taken_at: "2026-02-03T17:31:35+00:00",
    exif: { aperture: 1.8, isoSpeed: 160, exposureTime: 0.004, lens: "5.59mm f/1.8" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: false,
    view_count: 512,
    download_count: 98,
    size_bytes: 6368078,
    created_at: "",
    updated_at: ""
  },
  {
    id: "portfolio-seed-2",
    event_id: "portfolio",
    drive_file_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    filename: "Street & Architecture/Urban_Solitude.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    full_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    width: 4240,
    height: 2832,
    camera_make: "SONY",
    camera_model: "ILCE-6400",
    lens: "E 18-135mm F3.5-5.6 OSS",
    taken_at: "2026-02-19T15:41:08+00:00",
    exif: { aperture: 5.6, isoSpeed: 250, exposureTime: 0.005, lens: "E 18-135mm F3.5-5.6 OSS" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: false,
    view_count: 245,
    download_count: 28,
    size_bytes: 8402850,
    created_at: "",
    updated_at: ""
  },
  {
    id: "portfolio-seed-3",
    event_id: "portfolio",
    drive_file_id: "1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
    filename: "Events & Culture/Core_Committee_Group_Shot.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
    full_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
    width: 6000,
    height: 4000,
    camera_make: "SONY",
    camera_model: "ILCE-7M3",
    lens: "FE 28-70mm F3.5-5.6 OSS",
    taken_at: "2026-02-26T15:53:51+00:00",
    exif: { aperture: 7.1, isoSpeed: 4000, exposureTime: 0.008, lens: "FE 28-70mm F3.5-5.6 OSS" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: true,
    view_count: 312,
    download_count: 45,
    size_bytes: 13802850,
    created_at: "",
    updated_at: ""
  },
  {
    id: "portfolio-seed-4",
    event_id: "portfolio",
    drive_file_id: "1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    filename: "Landscapes & Nature/Monsoon_Rays.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    full_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    width: 2400,
    height: 1600,
    camera_make: "Canon",
    camera_model: "EOS 200D II",
    lens: "EF-S18-55mm f/4-5.6 IS STM",
    taken_at: "2026-02-02T18:08:40+00:00",
    exif: { aperture: 8, isoSpeed: 6400, exposureTime: 0.0062, lens: "EF-S18-55mm f/4-5.6 IS STM" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: false,
    view_count: 421,
    download_count: 67,
    size_bytes: 9283940,
    created_at: "",
    updated_at: ""
  },
  {
    id: "portfolio-seed-5",
    event_id: "portfolio",
    drive_file_id: "18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
    filename: "Events & Culture/Campfire_Team_Gathering.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
    full_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
    width: 3500,
    height: 2333,
    camera_make: "SONY",
    camera_model: "ILCE-7M4",
    lens: "FE 24-70mm F2.8 GM II",
    taken_at: "2026-01-20T19:12:00+00:00",
    exif: { aperture: 2.8, isoSpeed: 1600, exposureTime: 0.016, lens: "FE 24-70mm F2.8 GM II" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: false,
    view_count: 389,
    download_count: 52,
    size_bytes: 7890120,
    created_at: "",
    updated_at: ""
  },
  {
    id: "portfolio-seed-6",
    event_id: "portfolio",
    drive_file_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    filename: "Events & Culture/Sathvika_Stage_Performers.jpg",
    thumbnail_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    full_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    width: 4240,
    height: 2832,
    camera_make: "SONY",
    camera_model: "ILCE-6400",
    lens: "E 18-135mm F3.5-5.6 OSS",
    taken_at: "2026-02-19T15:41:08+00:00",
    exif: { aperture: 5.6, isoSpeed: 250, exposureTime: 0.005, lens: "E 18-135mm F3.5-5.6 OSS" },
    uploaded_by: null,
    edited_by: null,
    is_published: true,
    is_cover: false,
    view_count: 220,
    download_count: 14,
    size_bytes: 5293810,
    created_at: "",
    updated_at: ""
  }
];

export interface PortfolioItem {
  photo: Photo;
  title: string;
  section: string;
}

/** Parses raw filename path into section and clean title */
function parsePortfolioItem(photo: Photo): PortfolioItem {
  const rawPath = photo.filename || "Selected Capture.jpg";
  const parts = rawPath.split("/");

  let section = "Featured Work";
  let fileNamePart = rawPath;

  if (parts.length > 1 && parts[0]) {
    section = parts[0].trim();
    fileNamePart = parts.slice(1).join(" ");
  } else {
    // Determine section from file keywords if no subfolder
    const lower = rawPath.toLowerCase();
    if (lower.includes("portrait") || lower.includes("people") || lower.includes("face")) {
      section = "Portraits & People";
    } else if (lower.includes("urban") || lower.includes("street") || lower.includes("architecture")) {
      section = "Street & Architecture";
    } else if (lower.includes("landscape") || lower.includes("nature") || lower.includes("rays") || lower.includes("monsoon")) {
      section = "Landscapes & Nature";
    } else if (lower.includes("event") || lower.includes("stage") || lower.includes("group") || lower.includes("team")) {
      section = "Events & Culture";
    }
  }

  // Clean filename: remove extension, camera raw codes, underscores
  let title = fileNamePart.replace(/\.[^/.]+$/, "");
  title = title.replace(/^(DSC|IMG|_MG|P|DJI)_\d+[\s_-]*/i, "");
  title = title.replace(/[_-]+/g, " ").trim();

  if (!title || /^\d+$/.test(title)) {
    title = photo.camera_model ? `${photo.camera_model} Masterpiece` : "Selected Work";
  }

  // Format Title Case
  title = title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Format Section Name
  section = section
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return { photo, title, section };
}

function safeDims(photo: Photo): { width: number; height: number } {
  const w = photo.width && photo.width > 0 ? photo.width : 1200;
  const h = photo.height && photo.height > 0 ? photo.height : 800;
  const r = w / h;
  if (r < 0.4) return { width: w, height: Math.round(w / 0.4) };
  if (r > 3.5) return { width: w, height: Math.round(w / 3.5) };
  return { width: w, height: h };
}

export function PortfolioClient({ databasePhotos = [] }: { databasePhotos?: Photo[] }) {
  const rawPhotos = databasePhotos.length > 0 ? databasePhotos : seedPhotos;
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/drive/sync-public", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncFeedback(`Synced! Discovered ${data.eventsDiscovered} events.`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncFeedback(data.error || "Sync failed");
      }
    } catch {
      setSyncFeedback("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  // Parse all photos with titles & sections
  const items = useMemo(() => rawPhotos.map(parsePortfolioItem), [rawPhotos]);

  // Extract unique section names
  const sections = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.section));
    return Array.from(set).sort();
  }, [items]);

  // Filter items by section
  const filteredItems = useMemo(() => {
    if (selectedSection === "all") return items;
    return items.filter((item) => item.section === selectedSection);
  }, [items, selectedSection]);

  // Group filtered items by section for rendering
  const groupedSections = useMemo(() => {
    const map = new Map<string, PortfolioItem[]>();
    filteredItems.forEach((item) => {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)!.push(item);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  // All photos array for Lightbox navigation
  const lightboxPhotos = useMemo(() => filteredItems.map((item) => item.photo), [filteredItems]);

  const openLightboxForPhoto = useCallback((targetPhoto: Photo) => {
    const idx = lightboxPhotos.findIndex((p) => p.id === targetPhoto.id);
    if (idx !== -1) setLightboxIndex(idx);
  }, [lightboxPhotos]);

  if (rawPhotos.length === 0) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <EmptyState
          title="No photos in Drive Portfolio yet"
          description="Place your photos inside the 'portfolio' folder on Google Drive and click sync to publish them here."
        />
        <div className="pt-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isSyncing ? "Syncing Drive..." : "Sync Portfolio from Drive"}
          </button>
        </div>
        {syncFeedback && (
          <p className="text-xs text-purple-300 font-mono">{syncFeedback}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-16 text-left">
      {/* ── Section Filter Pills Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-white/40" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
            Categories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSection("all")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200",
              selectedSection === "all"
                ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                : "border-white/[0.08] text-white/45 hover:text-white hover:border-white/20"
            )}
          >
            All Works ({items.length})
          </button>
          {sections.map((sec) => {
            const count = items.filter((i) => i.section === sec).length;
            const active = selectedSection === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200",
                  active
                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    : "border-white/[0.08] text-white/45 hover:text-white hover:border-white/20"
                )}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grouped Section Galleries ── */}
      <div className="space-y-20">
        {groupedSections.map(([sectionName, sectionItems], sIdx) => {
          const albumPhotos = sectionItems.map((item) => {
            const { width, height } = safeDims(item.photo);
            return {
              src: getPhotoDisplayUrl(item.photo),
              width,
              height,
              key: item.photo.id,
            };
          });

          return (
            <section key={sectionName} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-white/30 font-bold tracking-widest">
                    0{sIdx + 1}
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/90 font-display">
                    {sectionName}
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-white/40 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.07]">
                  {sectionItems.length} {sectionItems.length === 1 ? "work" : "works"}
                </span>
              </div>

              {/* Proportional CSS Masonry Album */}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5 space-y-4 sm:space-y-5">
                {sectionItems.map((targetItem, index) => {
                  if (!targetItem) return null;
                  const p = targetItem.photo;
                  
                  const displayUrl = getPhotoDisplayUrl(p);

                  const w = p.width && p.width > 0 ? p.width : 1200;
                  const h = p.height && p.height > 0 ? p.height : 800;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "5%" }}
                      transition={{ duration: 0.45, ease: EASE, delay: (index % 4) * 0.05 }}
                      className="break-inside-avoid relative overflow-hidden cursor-pointer group bg-[#0B0515] rounded-xl border border-white/[0.06] hover:border-white/[0.2] transition-all duration-400"
                      onClick={() => openLightboxForPhoto(p)}
                    >
                      {/* Photo Image */}
                      <Image
                        src={displayUrl}
                        alt={targetItem.title}
                        width={w}
                        height={h}
                        unoptimized
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1100px) 33vw, 25vw"
                        className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />

                      {/* Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Center inspect icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <Expand className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Bottom Caption & EXIF metadata */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                          {targetItem.section}
                        </span>
                        <h3 className="text-xs font-bold text-white truncate leading-tight">
                          {targetItem.title}
                        </h3>

                        <div className="flex items-center justify-between text-[10px] text-white/45 font-mono border-t border-white/10 mt-2.5 pt-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <Camera size={9} className="shrink-0 text-white/60" />
                            {p.camera_model || "Manual Lens"}
                          </span>
                          {p.exif && (p.exif as any).aperture && (
                            <span className="flex items-center gap-1 shrink-0 bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white/70">
                              <Aperture size={8} />
                              f/{(p.exif as any).aperture}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Photo Lightbox ── */}
      {lightboxIndex >= 0 && (
        <PhotoLightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          eventTitle="Portfolio"
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </div>
  );
}
