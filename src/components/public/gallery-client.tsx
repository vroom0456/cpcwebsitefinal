"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Heart,
  Check,
  Download,
  Camera,
  Users,
  Crown,
  Star,
  Crop,
} from "lucide-react";
import type { Event, Photo } from "@/types/database";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSelectionStore } from "@/store/selection-store";
import { GalleryToolbar } from "@/components/public/gallery-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, getPhotoDisplayUrl } from "@/lib/utils";
import { downloadSinglePhoto } from "@/lib/utils/download";
import { CoverCropperModal } from "@/components/admin/cover-cropper-modal";
import { setCoverFromPhoto } from "@/lib/actions/photos.actions";
import { useRouter } from "next/navigation";

const PhotoLightbox = dynamic(() => import("@/components/public/photo-lightbox"), {
  ssr: false,
});

export function isGroupPhoto(photo: Photo): boolean {
  return photo.is_group_photo === true;
}

export function isChiefGuest(photo: Photo): boolean {
  return photo.is_chief_guest === true;
}

/* ─── Single photo card ─── */
function PhotoCard({
  photo,
  index,
  event,
  selectMode,
  onOpen,
  layoutMode = "masonry",
  isAdmin = false,
  onOpenCropper,
  onCoverChange,
}: {
  photo: Photo;
  event: Event;
  index: number;
  onOpen: (index: number) => void;
  selectMode: boolean;
  layoutMode?: "masonry" | "grid";
  isAdmin?: boolean;
  onOpenCropper?: (url: string) => void;
  onCoverChange?: (photoId: string, photoUrl: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isSelected, toggle: toggleSelected } = useSelectionStore();
  const fav = isFavorite(photo.id);
  const sel = isSelected(photo.id);
  const isGroup = isGroupPhoto(photo);
  const isChief = isChiefGuest(photo);

  const displayUrls = useMemo(() => {
    const list: string[] = [];
    if (photo.drive_file_id) {
      list.push(`https://lh3.googleusercontent.com/d/${photo.drive_file_id}=w800`);
      list.push(`https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=w800`);
    }
    const standardUrl = getPhotoDisplayUrl(photo, "thumbnail");
    if (standardUrl) list.push(standardUrl);
    if (photo.thumbnail_url) list.push(photo.thumbnail_url);
    if (photo.drive_file_id) list.push(`/api/drive/photo/${photo.drive_file_id}?sz=800`);
    return Array.from(new Set(list.filter(Boolean)));
  }, [photo]);

  const isFailed = errorCount >= displayUrls.length;
  const currentDisplayUrl = displayUrls[Math.min(errorCount, displayUrls.length - 1)]!;

  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  const estimatedRatio = useMemo(() => {
    if (photo.width && photo.height && photo.width > 0 && photo.height > 0) {
      return photo.width / photo.height;
    }
    if (isGroup) return 1.65;
    if (isChief) return 0.72;

    const name = (photo.filename || "").toLowerCase();
    if (name.includes("portrait") || name.includes("potrait") || name.includes("vertical") || name.includes("_p_")) {
      return 0.67;
    }
    if (name.includes("group") || name.includes("wide") || name.includes("stage") || name.includes("pano")) {
      return 1.77;
    }

    // Deterministic hash-based distribution for masonry variety
    let hash = 0;
    const key = photo.id + (photo.filename || "");
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const val = Math.abs(hash) % 100;
    if (val < 35) return 0.67;
    if (val < 50) return 0.75;
    if (val < 82) return 1.5;
    return 1.78;
  }, [photo, isGroup, isChief]);

  const activeRatio = naturalRatio || estimatedRatio;
  const w = 800;
  const h = Math.round(800 / activeRatio);
  const isGrid = layoutMode === "grid";
  const hasBadges = isGroup || photo.is_cover || isChief;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open photo ${photo.filename ? photo.filename.split("/").pop() : index + 1} in lightbox`}
      style={{ contentVisibility: "auto" }}
      className={cn(
        "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#0c0516] border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isGrid
          ? isGroup
            ? "col-span-1 sm:col-span-2 row-span-1 aspect-[16/9] w-full"
            : activeRatio < 0.85
            ? "col-span-1 row-span-2 aspect-[3/4] w-full"
            : "col-span-1 row-span-1 aspect-[4/3] w-full"
          : "w-full inline-block break-inside-avoid mb-2 sm:mb-4",
        isGroup
          ? "border-white/20 shadow-[0_10px_35px_rgba(255,255,255,0.05)] hover:border-white/40"
          : "border-white/[0.06] hover:border-[#7032B5]/40 hover:shadow-[0_12px_45px_-5px_rgba(112,50,181,0.15)]",
        sel && "ring-2 ring-white ring-offset-2 ring-offset-[#050208] border-white/60"
      )}
      onClick={() => {
        if (selectMode) toggleSelected(photo.id);
        else onOpen(index);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (selectMode) toggleSelected(photo.id);
          else onOpen(index);
        }
      }}
    >
      {/* Skeleton */}
      {!loaded && !isFailed && (
        <div
          className="w-full bg-[#120722] animate-pulse relative overflow-hidden"
          style={{ aspectRatio: `${w}/${h}` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Image */}
      {!isFailed ? (
        <Image
          src={currentDisplayUrl}
          alt={photo.filename || "Event photo"}
          width={w}
          height={h}
          unoptimized
          onLoad={(e) => {
            setLoaded(true);
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              const realRatio = img.naturalWidth / img.naturalHeight;
              if (!isNaN(realRatio) && realRatio > 0.45 && realRatio < 2.5) {
                setNaturalRatio(realRatio);
              }
            }
          }}
          onError={() => setErrorCount((prev) => prev + 1)}
          className={cn(
            "w-full h-auto object-cover transition-all duration-500 will-change-transform group-hover:scale-[1.03]",
            !loaded && "invisible absolute inset-0 opacity-0",
            isGrid && "h-full w-full object-cover"
          )}
        />
      ) : (
        <div className="w-full h-48 flex flex-col items-center justify-center bg-[#07030D] border border-white/5 p-4 text-center">
          <Camera size={24} className="text-white/20 mb-2" />
          <span className="text-[10px] text-white/40 font-mono">Image unavailable</span>
        </div>
      )}

      {/* Badges — Refined Black & Purple System */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20 pointer-events-none">
        {photo.is_cover && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3B1261]/80 backdrop-blur-md border border-[#A986E8]/40 px-2 py-0.5 text-[9px] font-semibold text-[#E9D5FF] shadow-md tracking-wide">
            <Star className="h-2.5 w-2.5 fill-[#C084FC] text-[#C084FC]" /> Cover
          </span>
        )}
        {isGroup && (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-medium text-white/90 shadow-md">
            <Users className="h-2.5 w-2.5 text-white/80" /> Group
          </span>
        )}
        {isChief && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2A0E45]/85 backdrop-blur-md border border-[#C084FC]/40 px-2 py-0.5 text-[9px] font-semibold text-[#E9D5FF] shadow-md">
            <Crown className="h-2.5 w-2.5 text-[#C084FC]" /> VIP
          </span>
        )}
      </div>

      {/* Hover vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Action buttons */}
      {!selectMode && (
        <>
          <button
            aria-label={fav ? "Unsave photo" : "Save photo"}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
            className={cn(
              "absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer",
              fav
                ? "bg-red-500/25 border-red-400/50 text-red-400 opacity-100 scale-100"
                : "bg-black/60 border-white/10 text-white/50 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:text-red-400 hover:bg-red-500/20"
            )}
          >
            <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", fav && "fill-current")} />
          </button>
          <button
            aria-label="Download photo"
            onClick={(e) => { e.stopPropagation(); downloadSinglePhoto(photo); }}
            className="absolute top-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
            style={{
              left: hasBadges ? undefined : "0.625rem",
              right: hasBadges ? "2.6rem" : undefined,
            }}
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div
          className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-1 z-30 bg-black/80 backdrop-blur-md border-t border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpenCropper?.(getPhotoDisplayUrl(photo))}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 border border-white/15 transition-all cursor-pointer"
            title="Crop & Set as Event Cover"
          >
            <Crop size={11} />
            <span>Crop Cover</span>
          </button>
          <button
            type="button"
            onClick={() => onCoverChange?.(photo.id, currentDisplayUrl)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-amber-500/30 text-white flex items-center gap-1 border border-white/15 transition-all cursor-pointer"
            title="Set as Event Cover"
          >
            <Star size={11} className={photo.is_cover ? "fill-amber-300 text-amber-300" : "text-white/60"} />
            <span>Cover</span>
          </button>
        </div>
      )}

      {/* Select mode overlay */}
      {selectMode && (
        <div className={cn(
          "absolute inset-0 z-20 flex items-center justify-center transition-colors duration-200",
          sel ? "bg-white/10 backdrop-blur-[2px]" : "bg-transparent"
        )}>
          <div className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-all duration-200",
            sel
              ? "border-white bg-white text-black scale-100 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              : "border-white/30 bg-black/30 text-white/40 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90"
          )}>
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          </div>
        </div>
      )}
    </div>
  );
}

export function GalleryClient({
  event,
  photos,
  isAdmin = false,
}: {
  event: Event;
  photos: Photo[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "group" | "chief" | "favorites">("all");
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");
  const [selectedCamera, setSelectedCamera] = useState<string>("all");

  // Cover Cropper Modal
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperPhotoUrl, setCropperPhotoUrl] = useState<string>("");

  const { isFavorite } = useFavoritesStore();

  const availableCameras = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      const cam = [p.camera_make, p.camera_model].filter(Boolean).join(" ").trim();
      if (cam) set.add(cam);
    });
    return Array.from(set).sort();
  }, [photos]);

  const groupPhotosCount = useMemo(() => photos.filter(isGroupPhoto).length, [photos]);
  const chiefGuestCount = useMemo(() => photos.filter(isChiefGuest).length, [photos]);

  // Extract subfolder paths
  const allSubfolderPaths = useMemo(() => {
    const set = new Set<string>();
    if (event.subfolders) {
      event.subfolders.forEach((s) => set.add(s.trim()));
    }
    photos.forEach((p) => {
      if (p.subfolder) set.add(p.subfolder.trim());
      else if (p.filename && p.filename.includes("/")) {
        const parts = p.filename.split("/");
        if (parts.length > 1) {
          const dir = parts.slice(0, -1).join("/").trim();
          if (dir) set.add(dir);
        }
      }
    });
    return Array.from(set).filter(Boolean);
  }, [event.subfolders, photos]);

  // Progressive rendering
  const [visibleCount, setVisibleCount] = useState(48);

  const visibleSubfolders = useMemo(() => {
    if (allSubfolderPaths.length === 0) return [];
    const sortedPaths = Array.from(new Set(allSubfolderPaths)).sort();
    return sortedPaths.map((path) => {
      const parts = path.split("/");
      const depth = parts.length - 1;
      const leafName = parts[parts.length - 1]!;
      const displayName = depth > 0 ? `${"  ".repeat(depth)}↳ ${leafName}` : leafName;
      const count = photos.filter((p) => {
        const sf = (p.subfolder?.trim() ?? "").toLowerCase();
        const fn = (p.filename ?? "").toLowerCase();
        const target = path.toLowerCase();
        return sf === target || sf.startsWith(target + "/") || fn.startsWith(target + "/") || fn.includes("/" + target + "/");
      }).length;
      return { name: displayName, fullPath: path, count };
    });
  }, [allSubfolderPaths, photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (selectedSubfolder !== "all") {
        const sf = (photo.subfolder?.trim() ?? "").toLowerCase();
        const fn = (photo.filename ?? "").toLowerCase();
        const target = selectedSubfolder.toLowerCase();
        const isMatch = sf === target || sf.startsWith(target + "/") || fn.startsWith(target + "/") || fn.includes("/" + target + "/");
        if (!isMatch) return false;
      }
      if (activeTab === "group" && !isGroupPhoto(photo)) return false;
      if (activeTab === "chief" && !isChiefGuest(photo)) return false;
      if ((activeTab === "favorites" || favoritesOnly) && !isFavorite(photo.id)) return false;
      if (selectedCamera !== "all") {
        const cam = [photo.camera_make, photo.camera_model].filter(Boolean).join(" ").trim();
        if (cam !== selectedCamera) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fname = (photo.filename || "").toLowerCase();
        if (!fname.includes(q)) return false;
      }
      return true;
    });
  }, [photos, selectedSubfolder, activeTab, favoritesOnly, selectedCamera, searchQuery, isFavorite]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(48); }, [selectedSubfolder, activeTab, selectedCamera, searchQuery, favoritesOnly]);

  // Infinite scroll
  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700) {
        setVisibleCount((prev) => Math.min(prev + 36, filteredPhotos.length));
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredPhotos.length]);

  const openLightbox = useCallback(
    (index: number) => { if (!selectMode) setLightboxIndex(index); },
    [selectMode]
  );

  // Auto-open lightbox if URL contains photo permalink (?photo= or ?p=)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const photoId = params.get("photo") || params.get("p");
    if (photoId && lightboxIndex === -1) {
      const idx = filteredPhotos.findIndex(
        (p) => p.id === photoId || p.drive_file_id === photoId
      );
      if (idx !== -1) {
        setLightboxIndex(idx);
      }
    }
  }, [filteredPhotos, lightboxIndex]);

  async function handleSetCover(photoId: string, photoUrl: string) {
    await setCoverFromPhoto(event.id, photoId, photoUrl);
    router.refresh();
  }

  function handleOpenCropper(url: string) {
    setCropperPhotoUrl(url);
    setCropperOpen(true);
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        title="FRAMES IN DEVELOPING"
        description="The photography team is currently curating and uploading captures for this event."
      />
    );
  }

  return (
    <>
      <GalleryToolbar
        eventTitle={event.title}
        photos={photos}
        filteredPhotos={filteredPhotos}
        driveFolderId={event.drive_folder_id}
        selectMode={selectMode}
        onToggleSelectMode={() => setSelectMode((v) => !v)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFavoritesOnly(tab === "favorites");
        }}
        selectedCamera={selectedCamera}
        onCameraChange={setSelectedCamera}
        availableCameras={availableCameras}
        groupPhotosCount={groupPhotosCount}
        chiefGuestCount={chiefGuestCount}
        visibleSubfolders={visibleSubfolders}
        selectedSubfolder={selectedSubfolder}
        onSelectSubfolder={setSelectedSubfolder}
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        isAdmin={isAdmin}
        onResetFilters={() => {
          setActiveTab("all");
          setSelectedCamera("all");
          setSelectedSubfolder("all");
          setSearchQuery("");
          setFavoritesOnly(false);
        }}
      />

      {/* Photo grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="NO PHOTOGRAPHS FOUND"
          description="Try changing your search query or folder filter."
        />
      ) : (
        <>
          <div
            className={cn(
              layoutMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4"
                : "columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4 [column-fill:_balance]"
            )}
          >
            {filteredPhotos.slice(0, visibleCount).map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                event={event}
                selectMode={selectMode}
                onOpen={openLightbox}
                layoutMode={layoutMode}
                isAdmin={isAdmin}
                onOpenCropper={handleOpenCropper}
                onCoverChange={handleSetCover}
              />
            ))}
          </div>

          {visibleCount < filteredPhotos.length && (
            <div className="flex justify-center pt-8 pb-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 48, filteredPhotos.length))}
                className="px-6 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/30 text-xs font-mono font-bold tracking-wider text-white transition-all cursor-pointer shadow-lg backdrop-blur-xl"
              >
                LOAD MORE FRAMES ({filteredPhotos.length - visibleCount} REMAINING)
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <PhotoLightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          eventTitle={event.title}
          onClose={() => setLightboxIndex(-1)}
        />
      )}

      {/* Admin Cover Cropper */}
      {isAdmin && (
        <CoverCropperModal
          isOpen={cropperOpen}
          photoUrl={cropperPhotoUrl}
          eventId={event.id}
          onClose={() => setCropperOpen(false)}
          onSaveSuccess={() => { router.refresh(); }}
        />
      )}
    </>
  );
}
