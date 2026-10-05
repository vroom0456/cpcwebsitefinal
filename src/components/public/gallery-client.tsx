"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Check,
  Download,
  Camera,
  Users,
  Crown,
  ZoomIn,
  Folder,
  ChevronLeft,
  LayoutGrid,
  Columns,
  Eye,
  EyeOff,
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
import { setPhotoTagAction, setPhotoPublished, setCoverFromPhoto } from "@/lib/actions/photos.actions";
import { useRouter } from "next/navigation";

const PhotoLightbox = dynamic(() => import("@/components/public/photo-lightbox"), {
  ssr: false,
});

export function isGroupPhoto(photo: Photo): boolean {
  if (photo.is_group_photo || (photo.exif && (photo.exif as any).is_group_photo)) return true;
  const name = (photo.filename || "").toLowerCase();
  return ["group", "team", "crowd", "faculty", "assembly", "members", "batch"].some(
    (kw) => name.includes(kw)
  );
}

export function isChiefGuest(photo: Photo): boolean {
  if (photo.is_chief_guest || (photo.exif && (photo.exif as any).is_chief_guest)) return true;
  const name = (photo.filename || "").toLowerCase();
  return ["chief", "guest", "vip", "dignitary", "minister", "speech", "inauguration", "lamp", "stage", "award"].some(
    (kw) => name.includes(kw)
  );
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

  const displayUrls = [
    getPhotoDisplayUrl(photo, "thumbnail"),
    photo.drive_file_id ? `/api/drive/photo/${photo.drive_file_id}?sz=400` : null,
    photo.drive_file_id ? `https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=w800` : null,
  ].filter(Boolean) as string[];

  const isFailed = errorCount >= displayUrls.length;
  const currentDisplayUrl = displayUrls[Math.min(errorCount, displayUrls.length - 1)]!;

  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  const estimatedRatio = useMemo(() => {
    // 1. Explicit dimensions in DB
    if (photo.width && photo.height && photo.width > 0 && photo.height > 0) {
      return photo.width / photo.height;
    }
    // 2. Group photos are wide
    if (isGroup) return 1.65;
    // 3. Chief guest / VIP portraits
    if (isChief) return 0.72;

    // 4. Filename cues
    const name = (photo.filename || "").toLowerCase();
    if (name.includes("portrait") || name.includes("potrait") || name.includes("vertical") || name.includes("_p_")) {
      return 0.67; // 2:3 classic tall portrait
    }
    if (name.includes("group") || name.includes("wide") || name.includes("stage") || name.includes("pano")) {
      return 1.77; // 16:9 wide group
    }

    // 5. Deterministic visual distribution for authentic masonry rhythm
    let hash = 0;
    const key = photo.id + (photo.filename || "");
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const val = Math.abs(hash) % 100;
    if (val < 35) return 0.67; // 2:3 Tall Portrait ("proper bigger portraits")
    if (val < 50) return 0.75; // 3:4 Medium Portrait
    if (val < 82) return 1.5;  // 3:2 Classic Landscape
    return 1.78;               // 16:9 Cinematic Wide Group
  }, [photo, isGroup, isChief]);

  const activeRatio = naturalRatio || estimatedRatio;
  const w = 800;
  const h = Math.round(800 / activeRatio);

  const isGrid = layoutMode === "grid";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.015, 0.2),
        ease: "easeOut",
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#0c0516] border cursor-pointer transition-all duration-300",
        isGrid
          ? isGroup
            ? "col-span-1 sm:col-span-2 row-span-1 aspect-[16/9] w-full"
            : activeRatio < 0.85
            ? "col-span-1 row-span-2 aspect-[3/4] w-full"
            : "col-span-1 row-span-1 aspect-[4/3] w-full"
          : "w-full inline-block break-inside-avoid mb-2 sm:mb-4",
        isGroup
          ? "border-purple-400/40 shadow-[0_10px_35px_rgba(157,94,229,0.2)] hover:border-purple-400/80 hover:shadow-[0_15px_45px_rgba(157,94,229,0.35)]"
          : "border-white/[0.06] hover:border-purple-500/40 hover:shadow-[0_12px_45px_-5px_rgba(157,94,229,0.4)]",
        sel && "ring-2 ring-[#C084FC] ring-offset-2 ring-offset-[#050208] border-[#C084FC]/60"
      )}
      onClick={() => {
        if (selectMode) toggleSelected(photo.id);
        else onOpen(index);
      }}
    >
      {/* Skeleton shimmer while loading */}
      {!loaded && !isFailed && (
        <div
          className="w-full bg-[#120722] animate-pulse relative overflow-hidden"
          style={{ aspectRatio: `${w}/${h}` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Main Image */}
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
          <span className="text-[10px] text-white/40 font-mono">Image loading preview unavailable</span>
        </div>
      )}

      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20 pointer-events-none">
        {photo.is_cover && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-500/50 px-2 py-0.5 text-[9px] font-bold text-amber-300 shadow-md">
            <Star className="h-2.5 w-2.5 fill-amber-300" /> Cover
          </span>
        )}
        {isGroup && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/30 backdrop-blur-md border border-purple-400/50 px-2 py-0.5 text-[9px] font-bold text-purple-200 shadow-md">
            <Users className="h-2.5 w-2.5 text-[#C084FC]" /> Group
          </span>
        )}
        {isChief && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-400/50 px-2 py-0.5 text-[9px] font-bold text-amber-200 shadow-md">
            <Crown className="h-2.5 w-2.5 text-amber-300" /> VIP
          </span>
        )}
      </div>

      {/* Vignette on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Zoom indicator */}
      {!selectMode && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(157,94,229,0.3)]">
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
      )}

      {/* Action buttons (Favorite & Download) */}
      {!selectMode && (
        <>
          <button
            aria-label={fav ? "Unsave photo" : "Save photo"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(photo.id);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              downloadSinglePhoto(photo);
            }}
            className="absolute top-2.5 left-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
            style={{ left: (isGroup || photo.is_cover || isChief) ? "auto" : undefined, right: (isGroup || photo.is_cover || isChief) ? "2.6rem" : undefined }}
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </>
      )}

      {/* Admin Quick Action Strip on Bottom */}
      {isAdmin && (
        <div
          className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-1 z-30 bg-black/80 backdrop-blur-md border-t border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpenCropper?.(getPhotoDisplayUrl(photo))}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-purple-500/30 text-white flex items-center gap-1 border border-white/15 transition-all cursor-pointer"
            title="Crop & Set as Event Cover"
          >
            <Crop size={11} className="text-[#C084FC]" />
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
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center transition-colors duration-200",
            sel ? "bg-[#9D5EE5]/20 backdrop-blur-[2px]" : "bg-transparent"
          )}
        >
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-all duration-200",
              sel
                ? "border-[#C084FC] bg-[#9D5EE5] text-white scale-100 shadow-[0_0_20px_rgba(157,94,229,0.5)]"
                : "border-white/30 bg-black/30 text-white/40 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90"
            )}
          >
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          </div>
        </div>
      )}
    </motion.div>
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

  // Cover Cropper Modal state
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

  // Extract all distinct subfolder paths
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

  // Clean subfolder list
  const visibleSubfolders = useMemo(() => {
    if (allSubfolderPaths.length === 0) return [];
    const rootsMap = new Map<string, number>();
    allSubfolderPaths.forEach((path) => {
      const root = path.split("/")[0]!.trim();
      rootsMap.set(root, (rootsMap.get(root) || 0) + 1);
    });

    return Array.from(rootsMap.keys()).map((r) => {
      const count = photos.filter(
        (p) =>
          p.subfolder === r ||
          p.subfolder?.startsWith(r + "/") ||
          p.filename?.startsWith(r + "/") ||
          p.filename?.includes("/" + r + "/")
      ).length;
      return { name: r, fullPath: r, count };
    });
  }, [allSubfolderPaths, photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (selectedSubfolder !== "all") {
        const isMatch =
          photo.subfolder === selectedSubfolder ||
          photo.subfolder?.startsWith(selectedSubfolder + "/") ||
          photo.filename?.startsWith(selectedSubfolder + "/") ||
          photo.filename?.includes("/" + selectedSubfolder + "/");
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
  }, [
    photos,
    selectedSubfolder,
    activeTab,
    favoritesOnly,
    selectedCamera,
    searchQuery,
    isFavorite,
  ]);

  const openLightbox = useCallback(
    (index: number) => {
      if (!selectMode) setLightboxIndex(index);
    },
    [selectMode]
  );

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
          if (tab === "favorites") setFavoritesOnly(true);
          else setFavoritesOnly(false);
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

      {/* ── Photo Grid View ── */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="NO PHOTOGRAPHS FOUND"
          description="Try changing your search query or folder filter."
        />
      ) : (
        <div
          className={cn(
            layoutMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4"
              : "columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4 [column-fill:_balance]"
          )}
        >
          {filteredPhotos.map((photo, index) => (
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

      {/* Admin Cover Cropper Modal */}
      {isAdmin && (
        <CoverCropperModal
          isOpen={cropperOpen}
          photoUrl={cropperPhotoUrl}
          eventId={event.id}
          onClose={() => setCropperOpen(false)}
          onSaveSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
