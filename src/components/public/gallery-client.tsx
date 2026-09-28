"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check, Download, Camera, Maximize2, Users, ImageIcon, Crown, Sparkles, RefreshCw, ZoomIn, Folder, ExternalLink } from "lucide-react";
import type { Event, Photo } from "@/types/database";
import { useFavoritesStore } from "@/store/favorites-store";
import { useSelectionStore } from "@/store/selection-store";
import { GalleryToolbar } from "@/components/public/gallery-toolbar";
import { AIFaceSearchModal } from "@/components/public/ai-face-search-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, getPhotoDisplayUrl } from "@/lib/utils";
import { downloadSinglePhoto } from "@/lib/utils/download";

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

import { AIFaceClusters, type FaceCluster } from "@/components/public/ai-face-clusters";

/* ─── Single photo card ─── */
function PhotoCard({
  photo,
  index,
  event,
  selectMode,
  onOpen,
}: {
  photo: Photo;
  event: Event;
  index: number;
  onOpen: (index: number) => void;
  selectMode: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isSelected, toggle: toggleSelected } = useSelectionStore();
  const fav = isFavorite(photo.id);
  const sel = isSelected(photo.id);

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
    const ratio = pw / ph;
    return {
      w: 800,
      h: Math.round(800 / ratio),
    };
  }, [photo]);

  return (
    <motion.div
      layoutId={`card-${photo.id}`}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.02, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#0c0516] border border-white/[0.05] cursor-pointer transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_10px_40px_-10px_rgba(157,94,229,0.35)] break-inside-avoid mb-2.5 sm:mb-4",
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

      {isFailed ? (
        <div className="flex flex-col items-center justify-center p-6 aspect-[4/3] bg-[#0c0516] text-white/30 text-center">
          <Camera size={24} className="mb-2 text-white/20" />
          <span className="text-[10px] font-mono">{cleanTitle}</span>
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
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
        <p className="text-[12px] font-semibold text-white leading-tight truncate drop-shadow-md">{cleanTitle}</p>
        {photo.camera_model && (
          <p className="text-[10px] text-white/55 font-mono mt-1 flex items-center gap-1">
            <Camera size={9} className="text-[#C084FC] shrink-0" />
            {photo.camera_model}
          </p>
        )}
      </div>

      {/* Center zoom icon (non-select mode) */}
      {!selectMode && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(157,94,229,0.3)]">
            <ZoomIn className="h-4 w-4" />
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
              "absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200",
              fav
                ? "bg-red-500/25 border-red-400/50 text-red-400 opacity-100 scale-100"
                : "bg-black/60 border-white/10 text-white/50 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:text-red-400 hover:bg-red-500/20"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
          </button>
          <button
            aria-label="Download photo"
            onClick={(e) => {
              e.stopPropagation();
              downloadSinglePhoto(photo);
            }}
            className="absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-white/15 transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5" />
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
              "w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-all duration-200",
              sel
                ? "border-[#C084FC] bg-[#9D5EE5] text-white scale-100 shadow-[0_0_20px_rgba(157,94,229,0.5)]"
                : "border-white/30 bg-black/30 text-white/40 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90"
            )}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function GalleryClient({ event, photos }: { event: Event; photos: Photo[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "group" | "chief" | "favorites">("all");
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMatchedPhotoIds, setAiMatchedPhotoIds] = useState<string[] | null>(null);
  const [aiConfidenceMap, setAiConfidenceMap] = useState<Record<string, number>>({});
  const [selectedCluster, setSelectedCluster] = useState<FaceCluster | null>(null);
  const [showFaceSort, setShowFaceSort] = useState(false);

  const { isFavorite } = useFavoritesStore();

  const groupPhotosCount = useMemo(() => photos.filter(isGroupPhoto).length, [photos]);
  const chiefGuestCount = useMemo(() => photos.filter(isChiefGuest).length, [photos]);

  const subfolders = useMemo(() => {
    const set = new Set<string>();
    if (event.subfolders) {
      event.subfolders.forEach((s) => set.add(s));
    }
    photos.forEach((p) => {
      if (p.subfolder) set.add(p.subfolder);
      else if (p.filename && p.filename.includes("/")) {
        const s = p.filename.split("/")[0]?.trim();
        if (s) set.add(s);
      }
    });
    return Array.from(set);
  }, [event.subfolders, photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (selectedSubfolder !== "all") {
        const isMatch =
          photo.subfolder === selectedSubfolder ||
          (photo.filename && photo.filename.startsWith(selectedSubfolder + "/"));
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
  }, [photos, selectedSubfolder, activeTab, favoritesOnly, searchQuery, isFavorite, aiMatchedPhotoIds, selectedCluster]);

  const openLightbox = useCallback(
    (index: number) => {
      if (!selectMode) setLightboxIndex(index);
    },
    [selectMode]
  );

  if (photos.length === 0) {
    return (
      <EmptyState
        title="No photos published yet"
        description="Check back once the post-processing team finishes editing."
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

      {/* ── Google Drive Folder Breadcrumb Bar ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 text-white/50 font-mono">
          <Folder size={14} className="text-[#9D5EE5]" />
          <Link href="/events" className="hover:text-white transition-colors">
            Google Drive
          </Link>
          <span>/</span>
          <Link href="/events" className="hover:text-white transition-colors">
            CBIT Photo Club
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{event.title}</span>
          {selectedSubfolder !== "all" && (
            <>
              <span>/</span>
              <span className="text-[#C084FC] font-semibold">{selectedSubfolder}</span>
            </>
          )}
        </div>

        {event.drive_folder_id && (
          <a
            href={`https://drive.google.com/drive/folders/${event.drive_folder_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-medium transition-all"
          >
            <ExternalLink size={12} className="text-[#C084FC]" />
            <span>Open in Google Drive</span>
          </a>
        )}
      </div>

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

      {/* AI Face Match Banner */}
      <AnimatePresence>
        {aiMatchedPhotoIds !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-purple-950/80 border border-purple-500/40 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/30 border border-purple-400/50 text-[#C084FC]">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Pic-Time AI Face Match Active
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#C084FC] bg-purple-950 border border-purple-500/40 font-bold">
                    {aiMatchedPhotoIds.length} Photos Found
                  </span>
                </p>
                <p className="text-[11px] text-white/60">
                  Showing all photos containing your face sorted by AI confidence.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAiMatchedPhotoIds(null);
                setAiConfidenceMap({});
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw size={13} /> Reset AI Filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face Clusters Panel */}
      {(showFaceSort || selectedCluster !== null) && (
        <div className="mb-6">
          <AIFaceClusters
            photos={photos}
            selectedClusterId={selectedCluster?.id ?? null}
            onSelectCluster={setSelectedCluster}
            onClose={() => setShowFaceSort(false)}
          />
        </div>
      )}

      {/* ── Subfolders Selector Pills (when event has nested folders) ── */}
      {subfolders.length > 0 && (
        <div className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-x-auto no-scrollbar py-2">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/40 mr-1 flex items-center gap-1.5 shrink-0">
            <Folder size={11} className="text-[#C084FC]" /> Subfolders:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubfolder("all")}
            className={cn(
              "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all cursor-pointer shrink-0",
              selectedSubfolder === "all"
                ? "bg-[#9D5EE5]/30 border border-[#9D5EE5]/60 text-white shadow-sm"
                : "bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white"
            )}
          >
            All Subfolders ({photos.length})
          </button>
          {subfolders.map((sf) => {
            const count = photos.filter(
              (p) => p.subfolder === sf || (p.filename && p.filename.startsWith(sf + "/"))
            ).length;
            return (
              <button
                key={sf}
                type="button"
                onClick={() => setSelectedSubfolder(selectedSubfolder === sf ? "all" : sf)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                  selectedSubfolder === sf
                    ? "bg-[#9D5EE5]/30 border border-[#9D5EE5]/60 text-white shadow-sm"
                    : "bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white"
                )}
              >
                <Folder size={10} className="text-[#9D5EE5]" />
                <span>{sf}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-2xl bg-white/[0.03] p-1 sm:p-1.5 border border-white/[0.07] backdrop-blur-md overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all" as const, icon: <ImageIcon size={12} className="text-[#C084FC]" />, label: `All (${photos.length})` },
            { id: "group" as const, icon: <Users size={12} className="text-[#C084FC]" />, label: `Group (${groupPhotosCount})` },
            { id: "chief" as const, icon: <Crown size={12} className="text-amber-400" />, label: `Chief Guest (${chiefGuestCount})` },
            { id: "favorites" as const, icon: <Heart size={12} className="text-red-400 fill-red-400/30" />, label: "Saved" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setFavoritesOnly(tab.id === "favorites");
              }}
              className={cn(
                "relative px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer overflow-hidden shrink-0",
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="gallery-tab-active"
                  className="absolute inset-0 bg-[#9D5EE5]/25 border border-[#9D5EE5]/40 rounded-xl shadow-lg shadow-purple-950/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] sm:text-xs font-mono text-white/30 shrink-0">
          {filteredPhotos.length} photos
        </p>
      </div>

      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="No photos match your filter"
          description="Try selecting a different filter tab or clearing your search term."
        />
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2.5 sm:gap-4">
          {filteredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              event={event}
              selectMode={selectMode}
              onOpen={openLightbox}
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
