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
  Calendar,
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
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const startScaleRef = useRef(1);
  const isDraggingRef = useRef(false);
  const lastTapTimeRef = useRef<number>(0);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const { isFavorite, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    if (filmstripRef.current) {
      const activeEl = filmstripRef.current.children[current] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [current]);

  const photo = photos[current];
  const isFirst = current === 0;
  const isLast = current === photos.length - 1;

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setScale(1);
      setPan({ x: 0, y: 0 });
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

  const toggleZoom = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

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
      if (e.key === "z" || e.key === "Z") toggleZoom();
      if (e.key === "i" || e.key === "I") setShowInfo((s) => !s);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose, toggleZoom]);

  // Touch gesture handlers (Pinch zoom, double-tap zoom, panning & swipe)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      if (t0 && t1) {
        const dist = Math.hypot(
          t0.clientX - t1.clientX,
          t0.clientY - t1.clientY
        );
        initialPinchDistRef.current = dist;
        startScaleRef.current = scale;
        isDraggingRef.current = true;
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        touchStartXRef.current = touch.clientX;
        touchStartYRef.current = touch.clientY;
        panStartRef.current = { x: pan.x, y: pan.y };
        isDraggingRef.current = false;
      }
    }
  }, [scale, pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    isDraggingRef.current = true;
    if (e.touches.length === 2 && initialPinchDistRef.current) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      if (t0 && t1) {
        const dist = Math.hypot(
          t0.clientX - t1.clientX,
          t0.clientY - t1.clientY
        );
        const ratio = dist / initialPinchDistRef.current;
        const newScale = Math.min(Math.max(1, startScaleRef.current * ratio), 4);
        setScale(newScale);
        if (newScale <= 1.05) {
          setPan({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && scale > 1 && touchStartXRef.current !== null && panStartRef.current) {
      const touch = e.touches[0];
      if (touch) {
        const deltaX = touch.clientX - touchStartXRef.current;
        const deltaY = touchStartYRef.current !== null ? touch.clientY - touchStartYRef.current : 0;
        setPan({
          x: panStartRef.current.x + deltaX,
          y: panStartRef.current.y + deltaY,
        });
      }
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (initialPinchDistRef.current !== null && e.touches.length < 2) {
      initialPinchDistRef.current = null;
      if (scale < 1.08) {
        setScale(1);
        setPan({ x: 0, y: 0 });
      }
      return;
    }

    // Double-tap zoom toggle
    const now = Date.now();
    if (!isDraggingRef.current && now - lastTapTimeRef.current < 280) {
      toggleZoom();
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    // Normal swipe when not zoomed
    if (scale <= 1) {
      const touch = e.changedTouches[0];
      if (touchStartXRef.current !== null && touch) {
        const deltaX = touch.clientX - touchStartXRef.current;
        const deltaY = touchStartYRef.current !== null ? touch.clientY - touchStartYRef.current : 0;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX < 0 && !isLast) {
            goNext();
          } else if (deltaX > 0 && !isFirst) {
            goPrev();
          }
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    panStartRef.current = null;
  }, [scale, toggleZoom, goNext, goPrev, isFirst, isLast]);

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
            drag={scale <= 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (scale <= 1) {
                if ((offset.x < -60 || velocity.x < -400) && !isLast) {
                  goNext();
                } else if ((offset.x > 60 || velocity.x > 400) && !isFirst) {
                  goPrev();
                }
              }
            }}
            className="absolute inset-0 flex items-center justify-center p-0 select-none"
            style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
          >
            <motion.div
              animate={{ scale, x: pan.x, y: pan.y }}
              transition={scale === 1 ? { duration: 0.25, ease: EASE } : { type: "tween", duration: 0.05 }}
              className="relative flex items-center justify-center w-full h-full cursor-zoom-in"
              onDoubleClick={(e) => {
                e.stopPropagation();
                toggleZoom();
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
            className="absolute bottom-3 left-0 right-0 z-40 flex flex-col items-center gap-2 px-3 pointer-events-none"
          >
            {/* Filmstrip Mode */}
            {photos.length > 1 && (
              <div className="w-full max-w-lg sm:max-w-xl overflow-hidden pointer-events-auto">
                <div
                  ref={filmstripRef}
                  className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 scrollbar-none rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {photos.map((p, idx) => {
                    const isSelected = idx === current;
                    const thumbUrl = getPhotoDisplayUrl(p, "thumbnail");
                    return (
                      <button
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          goTo(idx);
                        }}
                        className={cn(
                          "relative shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer border",
                          isSelected
                            ? "border-[#C084FC] scale-105 shadow-[0_0_10px_rgba(192,132,252,0.6)] opacity-100"
                            : "border-white/10 opacity-35 hover:opacity-80 hover:border-white/30"
                        )}
                        title={`Photo ${idx + 1}`}
                      >
                        <Image
                          src={thumbUrl}
                          alt=""
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 sm:gap-6 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-black/80 border border-white/15 backdrop-blur-2xl shadow-2xl pointer-events-auto">
              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(photo.id);
                }}
                className={cn(
                  "p-1.5 sm:p-2 rounded-full transition-transform active:scale-90 cursor-pointer",
                  isFavorite(photo.id) ? "text-red-400" : "text-white/80 hover:text-white"
                )}
                title={isFavorite(photo.id) ? "Remove Favorite" : "Favorite"}
              >
                <Heart size={17} className={cn(isFavorite(photo.id) && "fill-current")} />
              </button>

              {/* Direct Download */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSinglePhoto(photo);
                }}
                className="p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
                title="Download High-Res"
              >
                <Download size={17} />
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
                className="p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
                title="Share Photo"
              >
                {linkCopied ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
              </button>

              {/* Zoom toggle (available on mobile & desktop) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
                className="p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer flex"
                title={scale > 1 ? "Reset Zoom" : "Zoom In (2.5x)"}
              >
                {scale > 1 ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
              </button>

              {/* Details (Info) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={cn(
                  "p-1.5 sm:p-2 rounded-full transition-transform active:scale-90 cursor-pointer",
                  showInfo ? "text-[#C084FC]" : "text-white/80 hover:text-white"
                )}
                title="Details"
              >
                <Info size={17} />
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

              {/* Details Grid: Verified Authentic EXIF Only (Never invent metadata) */}
              <div className="space-y-3.5 text-xs">
                {(photo.camera_make || photo.camera_model) && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Camera size={16} className="text-[#C084FC] shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Camera</p>
                      <p className="font-semibold text-white tracking-wide">
                        {[photo.camera_make, photo.camera_model].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  </div>
                )}

                {photo.lens && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Aperture size={16} className="text-[#C084FC] shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Lens</p>
                      <p className="font-mono text-white/90">{photo.lens}</p>
                    </div>
                  </div>
                )}

                {Boolean(photo.exif?.FNumber || photo.exif?.ExposureTime || photo.exif?.ISOSpeedRatings) && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Clock size={16} className="text-[#C084FC] shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Exposure &amp; ISO</p>
                      <p className="font-mono text-white/90">
                        {[
                          photo.exif?.ExposureTime ? `${photo.exif.ExposureTime}s` : null,
                          photo.exif?.FNumber ? `f/${photo.exif.FNumber}` : null,
                          photo.exif?.ISOSpeedRatings ? `ISO ${photo.exif.ISOSpeedRatings}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                )}

                {photo.taken_at && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Calendar size={16} className="text-[#C084FC] shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Date Captured</p>
                      <p className="font-mono text-white/90">
                        {new Date(photo.taken_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {photo.width && photo.height && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-white/50 font-mono text-[11px]">
                    <span className="uppercase tracking-wider">Dimensions</span>
                    <span className="text-white/80">{photo.width} × {photo.height}</span>
                  </div>
                )}

                {Boolean(!photo.camera_make && !photo.camera_model && !photo.lens && !photo.exif?.FNumber && !photo.taken_at) && (
                  <div className="py-4 text-center text-xs font-mono text-white/40 space-y-1">
                    <Camera size={20} className="mx-auto text-white/20" />
                    <p>Camera EXIF data was not embedded in this file.</p>
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
