"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Check,
  Download,
  Camera,
  Users,
  ImageIcon,
  Crown,
  Sparkles,
  RefreshCw,
  ZoomIn,
  Folder,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Columns,
} from "lucide-react";
import type { Event, Photo } from "@/types/database";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSelectionStore } from "@/store/selection-store";
import { GalleryToolbar } from "@/components/public/gallery-toolbar";
import { AIFaceSearchModal } from "@/components/public/ai-face-search-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, getPhotoDisplayUrl } from "@/lib/utils";
import { downloadSinglePhoto } from "@/lib/utils/download";
import { AIFaceClusters, type FaceCluster } from "@/components/public/ai-face-clusters";

const PhotoLightbox = dynamic(() => import("@/components/public/photo-lightbox"), {
  ssr: false,
});

export function isGroupPhoto(photo: Photo): boolean {
  if (photo.is_group_photo || (photo.exif && photo.exif.is_group_photo)) return true;
  const name = (photo.filename || "").toLowerCase();
  return ["group", "team", "crowd", "faculty", "assembly", "members", "batch"].some(
    (kw) => name.includes(kw)
  );
}

export function isChiefGuest(photo: Photo): boolean {
  if (photo.is_chief_guest || (photo.exif && photo.exif.is_chief_guest)) return true;
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
}: {
  photo: Photo;
  event: Event;
  index: number;
  onOpen: (index: number) => void;
  selectMode: boolean;
  layoutMode?: "masonry" | "grid";
}) {
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isSelected, toggle: toggleSelected } = useSelectionStore();
  const fav = isFavorite(photo.id);
  const sel = isSelected(photo.id);
  const isGroup = isGroupPhoto(photo);

  // Fast loading chain: Primary disk-cached proxy -> 400px proxy -> Drive thumbnail
  const displayUrls = [
    getPhotoDisplayUrl(photo, "thumbnail"),
    photo.drive_file_id ? `/api/drive/photo/${photo.drive_file_id}?sz=400` : null,
    photo.drive_file_id ? `https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=w800` : null,
  ].filter(Boolean) as string[];

  const isFailed = errorCount >= displayUrls.length;
  const currentDisplayUrl = displayUrls[Math.min(errorCount, displayUrls.length - 1)]!;

  const cleanTitle = useMemo(() => {
    let t = photo.filename.split("/").pop() || "";
    t = t.replace(/\.[^/.]+$/, "");
    t = t.replace(/[_-]/g, " ");
    return t.length > 28 ? t.substring(0, 28) + "..." : t;
  }, [photo.filename]);

  const { w, h } = useMemo(() => {
    const pw = photo.width || 1600;
    const ph = photo.height || 1200;
    const rawRatio = pw / ph;
    // Harmonious clamp [0.8, 1.35]: prevents extreme tall spikes or tiny letterboxes so all photos have similar consistent grid sizing
    const ratio = Math.max(0.8, Math.min(1.35, isNaN(rawRatio) ? 1.33 : rawRatio));
    return {
      w: 800,
      h: Math.round(800 / ratio),
    };
  }, [photo]);

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
        // Consistent grid sizing overall without giant jarring gaps
        isGrid
          ? "col-span-1 row-span-1 aspect-[4/3] w-full"
          : "w-full break-inside-avoid mb-2.5 sm:mb-4",
        // Premium group styling vs normal styling
        isGroup
          ? "border-amber-400/40 shadow-[0_10px_35px_rgba(245,158,11,0.15)] hover:border-amber-400/80 hover:shadow-[0_16px_50px_rgba(245,158,11,0.28)]"
          : "border-white/[0.06] hover:border-purple-500/35 hover:shadow-[0_10px_40px_-10px_rgba(157,94,229,0.35)]",
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
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(110deg, #0c0516 30%, #160926 50%, #0c0516 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s linear infinite",
          }}
        />
      )}

      {/* Luxury Group Photo Badge */}
      {isGroup && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/30 border border-amber-400/60 backdrop-blur-md shadow-lg pointer-events-none">
          <Users size={11} className="text-amber-300" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-200 uppercase font-mono">
            Group Photo
          </span>
        </div>
      )}

      {isFailed ? (
        <div className="flex flex-col items-center justify-center p-6 aspect-[4/3] bg-[#0c0516] text-white/30 text-center">
          <Camera size={24} className="mb-2 text-white/20" />
          <span className="text-[10px] font-mono">{cleanTitle}</span>
        </div>
      ) : isGrid ? (
        <div className="relative w-full h-full min-h-[inherit]">
          <Image
            src={currentDisplayUrl}
            alt={`${cleanTitle} — ${event.title}`}
            fill
            unoptimized
            priority={index < 6}
            loading={index < 12 ? "eager" : "lazy"}
            sizes={isGroup ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
            className={cn(
              "object-cover transition-all duration-500 ease-out",
              "group-hover:scale-[1.03]",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (errorCount < displayUrls.length - 1) {
                setErrorCount((prev) => prev + 1);
              } else {
                setErrorCount(displayUrls.length);
                setLoaded(true);
              }
            }}
          />
        </div>
      ) : (
        <Image
          src={currentDisplayUrl}
          alt={`${cleanTitle} — ${event.title}`}
          width={w}
          height={h}
          unoptimized
          priority={index < 8}
          loading={index < 16 ? "eager" : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "w-full h-auto transition-all duration-500 ease-out",
            "group-hover:scale-[1.02]",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (errorCount < displayUrls.length - 1) {
              setErrorCount((prev) => prev + 1);
            } else {
              setErrorCount(displayUrls.length);
              setLoaded(true);
            }
          }}
        />
      )}

      {/* Rich gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

      {/* Purple tint overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(79,22,142,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
        <p className="text-[11px] sm:text-[12px] font-semibold text-white leading-tight truncate drop-shadow-md">
          {cleanTitle}
        </p>
        {photo.camera_model && (
          <p className="text-[9px] sm:text-[10px] text-white/55 font-mono mt-1 flex items-center gap-1">
            <Camera size={9} className="text-[#C084FC] shrink-0" />
            {photo.camera_model}
          </p>
        )}
      </div>

      {/* Center zoom icon (non-select mode) */}
      {!selectMode && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(157,94,229,0.3)]">
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
      )}

      {/* Favourite button */}
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
            className="absolute top-2.5 left-2.5 sm:left-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
            style={{ left: isGroup ? "auto" : undefined, right: isGroup ? "2.8rem" : undefined }}
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </>
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

export function GalleryClient({ event, photos }: { event: Event; photos: Photo[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "group" | "chief" | "faces" | "favorites">("all");
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMatchedPhotoIds, setAiMatchedPhotoIds] = useState<string[] | null>(null);
  const [aiConfidenceMap, setAiConfidenceMap] = useState<Record<string, number>>({});
  const [selectedCluster, setSelectedCluster] = useState<FaceCluster | null>(null);
  const [showFaceSort, setShowFaceSort] = useState(false);

  const { isFavorite } = useFavoritesStore();

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
        // Add full path prefix excluding filename
        if (parts.length > 1) {
          const dir = parts.slice(0, -1).join("/").trim();
          if (dir) set.add(dir);
        }
      }
    });
    return Array.from(set).filter(Boolean);
  }, [event.subfolders, photos]);

  // Multi-level Hierarchical Navigation: Determine current folder level & visible child pills
  const { currentBreadcrumb, visibleChildFolders } = useMemo(() => {
    if (allSubfolderPaths.length === 0) {
      return { currentBreadcrumb: [], visibleChildFolders: [] };
    }

    if (selectedSubfolder === "all") {
      // Find top-level root folders (first path segment)
      const rootFoldersMap = new Map<string, number>();
      allSubfolderPaths.forEach((path) => {
        const root = path.split("/")[0]!.trim();
        rootFoldersMap.set(root, (rootFoldersMap.get(root) || 0) + 1);
      });

      const roots = Array.from(rootFoldersMap.keys()).map((r) => {
        const count = photos.filter(
          (p) =>
            p.subfolder === r ||
            p.subfolder?.startsWith(r + "/") ||
            p.filename?.startsWith(r + "/") ||
            p.filename?.includes("/" + r + "/")
        ).length;
        return { name: r, fullPath: r, count };
      });

      return { currentBreadcrumb: [], visibleChildFolders: roots };
    }

    // When inside a subfolder (e.g. "Day - 2" or "Day - 2/Battle of bands")
    const segments = selectedSubfolder.split("/").map((s) => s.trim());
    const breadcrumb = segments.map((seg, idx) => ({
      name: seg,
      path: segments.slice(0, idx + 1).join("/"),
    }));

    // Find direct child folders of the selected folder
    const prefix = selectedSubfolder + "/";
    const childMap = new Map<string, string>(); // child name -> full path

    allSubfolderPaths.forEach((path) => {
      if (path.startsWith(prefix)) {
        const remainder = path.slice(prefix.length);
        const childName = remainder.split("/")[0]!.trim();
        if (childName) {
          childMap.set(childName, `${selectedSubfolder}/${childName}`);
        }
      }
    });

    const children = Array.from(childMap.entries()).map(([name, fullPath]) => {
      const count = photos.filter(
        (p) =>
          p.subfolder === fullPath ||
          p.subfolder?.startsWith(fullPath + "/") ||
          p.filename?.startsWith(fullPath + "/") ||
          p.filename?.includes("/" + fullPath + "/")
      ).length;
      return { name, fullPath, count };
    });

    return { currentBreadcrumb: breadcrumb, visibleChildFolders: children };
  }, [allSubfolderPaths, selectedSubfolder, photos]);

  // Filter photos matching current active subfolder, face cluster, AI match, search, tab
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
      if (selectedCluster !== null && !selectedCluster.photoIds.includes(photo.id)) return false;
      if (aiMatchedPhotoIds !== null && !aiMatchedPhotoIds.includes(photo.id)) return false;
      if (activeTab === "group" && !isGroupPhoto(photo)) return false;
      if (activeTab === "chief" && !isChiefGuest(photo)) return false;
      if ((activeTab === "favorites" || favoritesOnly) && !isFavorite(photo.id)) return false;
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
    searchQuery,
    isFavorite,
    aiMatchedPhotoIds,
    selectedCluster,
  ]);

  const openLightbox = useCallback(
    (index: number) => {
      if (!selectMode) setLightboxIndex(index);
    },
    [selectMode]
  );

  if (photos.length === 0) {
    return (
      <EmptyState
        title="FRAMES IN DEVELOPING"
        description="The post-processing and darkroom team is currently curating and color grading captures for this event."
      />
    );
  }

  return (
    <>
      <AIFaceSearchModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        photos={photos}
        onFaceMatchSuccess={(matchedIds, confMap) => {
          setAiMatchedPhotoIds(matchedIds);
          setAiConfidenceMap(confMap);
        }}
      />

      <GalleryToolbar
        eventTitle={event.title}
        photos={photos}
        selectMode={selectMode}
        onToggleSelectMode={() => setSelectMode((v) => !v)}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => {
          setFavoritesOnly((v) => !v);
          setActiveTab((prev) => (prev === "favorites" ? "all" : "favorites"));
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAIFaceSearch={() => setAiModalOpen(true)}
        aiFaceMatchActive={aiMatchedPhotoIds !== null}
        onToggleFaceSort={() => setShowFaceSort((v) => !v)}
        showFaceSort={showFaceSort}
      />

      {/* AI Face Match Active Banner */}
      <AnimatePresence>
        {aiMatchedPhotoIds !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-purple-950/80 border border-purple-500/40 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/30 border border-purple-400/50 text-[#C084FC]">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2 font-display tracking-wide uppercase">
                  FOUND {aiMatchedPhotoIds.length} PHOTOS
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#C084FC] bg-purple-950 border border-purple-500/40 font-bold">
                    AI MATCH
                  </span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/60">
                  Showing all photographs you appear in, ordered by detection confidence.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAiMatchedPhotoIds(null);
                setAiConfidenceMap({});
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw size={12} /> Reset AI Filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Face Filter Banner */}
      {selectedCluster && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-purple-950/80 border border-purple-500/40 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#C084FC] shrink-0">
              <Image
                src={
                  selectedCluster.coverPhoto.thumbnail_url ||
                  getPhotoDisplayUrl(selectedCluster.coverPhoto, "thumbnail")
                }
                alt="Selected Person"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                Face Filter Active
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#C084FC] bg-purple-950 border border-purple-500/40 font-bold">
                  {selectedCluster.photoIds.length} Photos Found
                </span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-white/60">
                Displaying all event photos containing this attendee&apos;s face.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCluster(null)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer shrink-0 transition-all"
          >
            Show All
          </button>
        </motion.div>
      )}

      {/* Face Clusters Panel */}
      {(showFaceSort || selectedCluster !== null || activeTab === "faces") && (
        <div className="mb-5 sm:mb-6">
          <AIFaceClusters
            photos={photos}
            eventId={event.id}
            selectedClusterId={selectedCluster?.id ?? null}
            onSelectCluster={setSelectedCluster}
            onClose={() => {
              setShowFaceSort(false);
              if (activeTab === "faces") setActiveTab("all");
            }}
          />
        </div>
      )}

      {/* ── Subfolders Selector ── */}
      {allSubfolderPaths.length > 0 && (
        <div className="mb-3 sm:mb-4 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {selectedSubfolder !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedSubfolder("all")}
              className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-[#9D5EE5]/20 border border-[#9D5EE5]/40 text-[#C084FC] hover:text-white flex items-center gap-1 shrink-0 transition-all cursor-pointer"
            >
              <ChevronLeft size={12} /> All Folders
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedSubfolder("all")}
            className={cn(
              "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium transition-all cursor-pointer shrink-0",
              selectedSubfolder === "all"
                ? "bg-[#9D5EE5]/30 border border-[#9D5EE5]/60 text-white shadow-sm"
                : "bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white"
            )}
          >
            All ({photos.length})
          </button>

          {visibleChildFolders.map((folder) => {
            const isActive = selectedSubfolder === folder.fullPath;
            return (
              <button
                key={folder.fullPath}
                type="button"
                onClick={() => setSelectedSubfolder(isActive ? "all" : folder.fullPath)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                  isActive
                    ? "bg-[#9D5EE5]/30 border border-[#9D5EE5]/60 text-white shadow-sm"
                    : "bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white"
                )}
              >
                <Folder size={10} className="text-[#9D5EE5]" />
                <span>{folder.name}</span>
                <span className="opacity-60 text-[9px] sm:text-[10px]">({folder.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Tabs + Layout Mode Switcher */}
      <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-white/[0.03] p-1 border border-white/[0.07] backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: "all" as const, icon: <ImageIcon size={12} className="text-[#C084FC]" />, label: `All (${photos.length})` },
            { id: "group" as const, icon: <Users size={12} className="text-amber-300" />, label: `Group (${groupPhotosCount})` },
            { id: "chief" as const, icon: <Crown size={12} className="text-amber-400" />, label: `Chief Guest (${chiefGuestCount})` },
            { id: "faces" as const, icon: <Sparkles size={12} className="text-[#C084FC]" />, label: "Faces" },
            { id: "favorites" as const, icon: <Heart size={12} className="text-red-400 fill-red-400/30" />, label: "Saved" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "faces") {
                  setShowFaceSort(true);
                }
                setFavoritesOnly(tab.id === "favorites");
              }}
              className={cn(
                "relative px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 cursor-pointer overflow-hidden shrink-0",
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {activeTab === tab.id && (
                <div
                  className="absolute inset-0 bg-[#9D5EE5]/25 border border-[#9D5EE5]/40 rounded-xl shadow-lg shadow-purple-950/40"
                />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right tools: Photo count + Layout Switcher (Desktop only) */}
        <div className="hidden sm:flex items-center justify-end gap-3 px-1 shrink-0">
          <p className="text-[11px] sm:text-xs font-mono text-white/30 shrink-0">
            {filteredPhotos.length} photos
          </p>
          <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setLayoutMode("masonry")}
              title="Masonry Waterfall"
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1",
                layoutMode === "masonry" ? "bg-purple-600 text-white shadow-sm" : "text-white/40 hover:text-white"
              )}
            >
              <Columns size={13} />
              <span className="hidden sm:inline text-[10px] font-mono">Masonry</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              title="Editorial Grid"
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1",
                layoutMode === "grid" ? "bg-purple-600 text-white shadow-sm" : "text-white/40 hover:text-white"
              )}
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline text-[10px] font-mono">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="NO FRAMES FOUND"
          description="No captures match your current filter or search query. Try adjusting keywords or viewing all photos."
        />
      ) : layoutMode === "masonry" ? (
        <div className="columns-2 sm:columns-3 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              event={event}
              selectMode={selectMode}
              onOpen={openLightbox}
              layoutMode="masonry"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 grid-flow-dense">
          {filteredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              event={event}
              selectMode={selectMode}
              onOpen={openLightbox}
              layoutMode="grid"
            />
          ))}
        </div>
      )}

      {lightboxIndex >= 0 && (
        <PhotoLightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          eventTitle={event.title}
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </>
  );
}
