"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Heart,
  Info,
  Camera,
  Aperture,
  Clock,
  Share2,
  ArrowLeft,
  Check,
} from "lucide-react";
import type { Photo } from "@/types/database";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadSinglePhoto } from "@/lib/utils/download";
import { cn, getPhotoDisplayUrl, formatEventDate } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

interface PhotoLightboxProps {
  photos: Photo[];
  index: number;
  eventTitle?: string;
  onClose: () => void;
}

export default function PhotoLightbox({
  photos,
  index: initialIndex,
  eventTitle,
  onClose,
}: PhotoLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const photo = photos[current];
  const isFirst = current === 0;
  const isLast = current === photos.length - 1;

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setZoomed(false);
      setFullLoaded(false);
      setCurrent(idx);
    },
    [current]
  );

  const goNext = useCallback(() => {
    if (!isLast) goTo(current + 1);
  }, [current, isLast, goTo]);

  const goPrev = useCallback(() => {
    if (!isFirst) goTo(current - 1);
  }, [current, isFirst, goTo]);

  // Samsung Gallery lookahead preloader:
  // Preloads prev 2 and next 2 photos immediately into memory cache
  useEffect(() => {
    const targets = [current - 2, current - 1, current + 1, current + 2];
    targets.forEach((idx) => {
      if (idx >= 0 && idx < photos.length) {
        const p = photos[idx];
        if (p) {
          // Preload thumbnail first
          const thumb = new window.Image();
          thumb.src = getPhotoDisplayUrl(p, "thumbnail");
          // Preload high-res full image
          const full = new window.Image();
          full.src = getPhotoDisplayUrl(p, "full");
        }
      }
    });
  }, [current, photos]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
      if (e.key === "z" || e.key === "Z") setZoomed((z) => !z);
      if (e.key === "i" || e.key === "I") setShowInfo((s) => !s);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (e.touches.length === 1 && touch) {
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      isDraggingRef.current = false;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touchStartXRef.current === null || !touch) return;
      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touchStartYRef.current !== null ? touch.clientY - touchStartYRef.current : 0;

      // Swipe navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX < 0 && !isLast) {
          goNext();
        } else if (deltaX > 0 && !isFirst) {
          goPrev();
        }
      }

      touchStartXRef.current = null;
      touchStartYRef.current = null;
    },
    [goNext, goPrev, isFirst, isLast]
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  if (!photo) return null;

  const thumbSrc = getPhotoDisplayUrl(photo, "thumbnail");
  const fullSrc = getPhotoDisplayUrl(photo, "full");

  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "80vw" : "-80vw",
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 320, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.25, ease: EASE },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-80vw" : "80vw",
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: "spring", stiffness: 320, damping: 32 },
        opacity: { duration: 0.18 },
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-black text-white select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* ── Top Samsung Gallery Bar ── */}
      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-3 sm:px-6 py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm"
          >
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={onClose}
                className="p-2 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Back / Close"
                aria-label="Back"
              >
                <ArrowLeft size={19} />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                  {eventTitle || photo.filename}
                </span>
                {photo.taken_at && (
                  <span className="text-[10px] text-white/50 font-mono">
                    {formatEventDate(photo.taken_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Counter + Info + Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-medium text-white/60 px-2 py-1 rounded-full bg-white/10">
                {current + 1} / {photos.length}
              </span>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={cn(
                  "p-2 rounded-full transition-all cursor-pointer",
                  showInfo ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                title="Photo Details"
              >
                <Info size={17} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer hidden sm:flex"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Photo Viewing Area ── */}
      <div
        className="flex-1 relative flex items-center justify-center w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          // Single tap toggles UI chrome (immersive mode)
          if (!isDraggingRef.current) {
            setUiVisible((v) => !v);
          }
        }}
      >
        {/* Navigation Chevrons (Desktop) */}
        {!isFirst && uiVisible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="hidden md:flex absolute left-4 z-30 items-center justify-center w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {!isLast && uiVisible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="hidden md:flex absolute right-4 z-30 items-center justify-center w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Animated Swipe Photo Container */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if ((offset.x < -60 || velocity.x < -400) && !isLast) {
                goNext();
              } else if ((offset.x > 60 || velocity.x > 400) && !isFirst) {
                goPrev();
              }
            }}
            className="absolute inset-0 flex items-center justify-center p-0 select-none"
            style={{ touchAction: "none" }}
          >
            <motion.div
              animate={{ scale: zoomed ? 2 : 1 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="relative flex items-center justify-center w-full h-full cursor-zoom-in"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
            >
              {/* Immediate Fast Thumbnail Layer (renders in 0ms from browser cache) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc}
                alt=""
                aria-hidden
                className={cn(
                  "absolute max-h-screen w-full h-full object-contain filter transition-opacity duration-300",
                  fullLoaded ? "opacity-0 pointer-events-none" : "opacity-100 blur-[2px]"
                )}
              />

              {/* High-Resolution Full Display Photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullSrc}
                alt={photo.filename || "Photo"}
                onLoad={() => setFullLoaded(true)}
                className={cn(
                  "relative max-h-screen w-full h-full object-contain select-none transition-opacity duration-200",
                  fullLoaded ? "opacity-100" : "opacity-0"
                )}
                draggable={false}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (photo.drive_file_id && !target.src.includes("lh3.googleusercontent.com")) {
                    target.src = `https://lh3.googleusercontent.com/d/${photo.drive_file_id}=s1800`;
                  } else if (photo.drive_file_id && !target.src.includes("drive.google.com/thumbnail")) {
                    target.src = `https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=w1800`;
                  } else {
                    target.src = "/images/placeholder-event.jpg";
                  }
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Samsung Gallery Action Bar ── */}
      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="flex items-center gap-4 sm:gap-6 px-5 py-2.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-2xl shadow-2xl pointer-events-auto">
              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(photo.id);
                }}
                className={cn(
                  "p-2 rounded-full transition-transform active:scale-90 cursor-pointer",
                  isFavorite(photo.id) ? "text-red-400" : "text-white/80 hover:text-white"
                )}
                title={isFavorite(photo.id) ? "Remove Favorite" : "Favorite"}
              >
                <Heart size={19} className={cn(isFavorite(photo.id) && "fill-current")} />
              </button>

              {/* Direct Download */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSinglePhoto(photo);
                }}
                className="p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
                title="Download High-Res"
              >
                <Download size={19} />
              </button>

              {/* Share */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const shareUrl = `${window.location.origin}${window.location.pathname}?photo=${photo.id}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: eventTitle || "CBIT Photo Club",
                        url: shareUrl,
                      });
                      return;
                    } catch {
                      // Fallback to clipboard
                    }
                  }
                  await navigator.clipboard.writeText(shareUrl);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
                title="Share Photo"
              >
                {linkCopied ? <Check size={19} className="text-emerald-400" /> : <Share2 size={19} />}
              </button>

              {/* Zoom toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(!zoomed);
                }}
                className="p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer hidden sm:flex"
                title={zoomed ? "Zoom Out" : "Zoom In"}
              >
                {zoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
              </button>

              {/* Details (Info) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={cn(
                  "p-2 rounded-full transition-transform active:scale-90 cursor-pointer",
                  showInfo ? "text-[#C084FC]" : "text-white/80 hover:text-white"
                )}
                title="Details"
              >
                <Info size={19} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Samsung Gallery Details Drawer (Info Bottom Sheet) ── */}
      <AnimatePresence>
        {showInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#10091D] border-t border-white/15 rounded-t-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Photo Details
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-white/70">
                  <Camera size={16} className="text-[#C084FC] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Camera</p>
                    <p className="font-medium text-white">
                      {photo.camera_make || "Unknown"} {photo.camera_model || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/70">
                  <Aperture size={16} className="text-[#C084FC] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Lens &amp; Settings</p>
                    <p className="font-mono text-white/90">
                      {photo.lens || "Standard Lens"}
                      {photo.exif?.FNumber ? ` · f/${photo.exif.FNumber}` : ""}
                      {photo.exif?.ISOSpeedRatings ? ` · ISO ${photo.exif.ISOSpeedRatings}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/70">
                  <Clock size={16} className="text-[#C084FC] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Date Taken</p>
                    <p className="font-mono text-white/90">
                      {photo.taken_at
                        ? new Date(photo.taken_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {photo.width && photo.height && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-white/50 font-mono text-[11px]">
                    <span>Resolution</span>
                    <span className="text-white/80">{photo.width} × {photo.height}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
