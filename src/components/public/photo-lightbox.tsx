"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Download,
  ZoomIn, ZoomOut, Maximize2, Heart,
  Info, Camera, Aperture, Clock, Share2, Link2, Copy, Check
} from "lucide-react";
import type { Photo } from "@/types/database";
import { useFavoritesStore } from "@/store/favorites-store";
import { downloadSinglePhoto } from "@/lib/utils/download";
import { cn, getPhotoDisplayUrl } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const swipeConfidenceThreshold = 1000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface PhotoLightboxProps {
  photos: Photo[];
  index: number;
  eventTitle?: string;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, index: initialIndex, eventTitle, onClose }: PhotoLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const isGestureLockedRef = useRef(false);
  const accumulatedDeltaXRef = useRef(0);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const thumbsRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const photo = photos[current];
  const isFirst = current === 0;
  const isLast = current === photos.length - 1;

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setZoomed(false);
    setCurrent(idx);
  }, [current]);

  const goNext = useCallback(() => { if (!isLast) goTo(current + 1); }, [current, isLast, goTo]);
  const goPrev = useCallback(() => { if (!isFirst) goTo(current - 1); }, [current, isFirst, goTo]);

  // Direct touch gesture handlers for mobile touchscreens & tablets
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (e.touches.length === 1 && touch) {
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touchStartXRef.current === null || touchStartYRef.current === null || !touch) return;
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Detect horizontal swipe gesture (deltaX larger than deltaY and > 30px threshold)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      if (deltaX < 0 && !isLast) {
        goNext();
      } else if (deltaX > 0 && !isFirst) {
        goPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  }, [goNext, goPrev, isFirst, isLast]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const el = thumbsRef.current?.querySelector(`[data-active="true"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
      if (e.key === "z" || e.key === "Z") setZoomed((z) => !z);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  // Listen to wheel events for trackpad horizontal swipe (macOS Photos style gesture locking using refs)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ignore if it's mostly a vertical scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 1.5) return;

      // Prevent browser default history-navigation swipe
      e.preventDefault();

      if (isGestureLockedRef.current) {
        // Continuous wheel events reset the unlock timer, keeping it locked until they stop swiping
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = setTimeout(() => {
          isGestureLockedRef.current = false;
        }, 250); // 250ms absorption cooldown matches macOS Photos swipe feel
        return;
      }

      accumulatedDeltaXRef.current += e.deltaX;

      if (accumulatedDeltaXRef.current > 50) {
        goNext();
        accumulatedDeltaXRef.current = 0;
        isGestureLockedRef.current = true;
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = setTimeout(() => {
          isGestureLockedRef.current = false;
        }, 400);
      } else if (accumulatedDeltaXRef.current < -50) {
        goPrev();
        accumulatedDeltaXRef.current = 0;
        isGestureLockedRef.current = true;
        if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = setTimeout(() => {
          isGestureLockedRef.current = false;
        }, 500);
      }

      // Also reset accumulated delta if swipe ceases briefly
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = setTimeout(() => {
        accumulatedDeltaXRef.current = 0;
        isGestureLockedRef.current = false;
      }, 300);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      // Removed clearTimeout here so the unlock timer can safely resolve even if re-rendered.
    };
  }, [goNext, goPrev]);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // macOS Dock magnification state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getScale = (i: number) => {
    const isActive = i === current;
    if (hoveredIndex !== null) {
      const dist = Math.abs(i - hoveredIndex);
      if (dist === 0) return 1.35;
      if (dist === 1) return 1.18;
      if (dist === 2) return 1.05;
      return 0.9;
    }
    return isActive ? 1.25 : 0.9;
  };

  const getOpacity = (i: number) => {
    const isActive = i === current;
    if (hoveredIndex !== null) {
      const dist = Math.abs(i - hoveredIndex);
      if (dist === 0) return 1;
      if (dist === 1) return 0.8;
      if (dist === 2) return 0.6;
      return 0.4;
    }
    return isActive ? 1 : 0.4;
  };

  const getMargin = (i: number) => {
    const isActive = i === current;
    if (hoveredIndex !== null) {
      const dist = Math.abs(i - hoveredIndex);
      if (dist <= 1) return "10px";
      return "2px";
    }
    return isActive ? "10px" : "2px";
  };

  if (!photo) return null;

  const photoSrc = getPhotoDisplayUrl(photo, "full");

  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "70vw" : "-70vw",
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.35, ease: EASE },
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-70vw" : "70vw",
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.35, ease: EASE },
      }
    }),
  };

  const isGraduation = eventTitle?.toLowerCase().includes("grad") || eventTitle?.toLowerCase().includes("convo") || eventTitle?.toLowerCase().includes("farewell");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "rgba(2, 1, 5, 0.97)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${photo.filename || "photo"}`}
    >
      {/* ── Top toolbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex-shrink-0 flex items-center justify-between px-3 py-2 sm:px-5 sm:py-4 z-10"
        style={{ background: "linear-gradient(180deg, rgba(2,1,5,0.9) 0%, transparent 100%)" }}
      >
        {/* Counter + keyboard hint */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold tabular-nums text-[#F8F5FB]/40 tracking-wider">
            {String(current + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-[#F8F5FB]/15 tracking-widest">
            {["←", "→", "Esc", "Z"].map(k => (
              <kbd key={k} className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#F8F5FB]/25">{k}</kbd>
            ))}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LightboxButton
            onClick={() => { if (photo) toggleFavorite(photo.id); }}
            aria-label={isFavorite(photo?.id) ? "Remove from favorites" : "Add to favorites"}
            active={isFavorite(photo?.id)}
            activeClass="text-red-400 border-red-400/40 bg-red-500/10"
          >
            <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isFavorite(photo?.id) && "fill-current")} />
          </LightboxButton>
          
          <LightboxButton
            onClick={async () => {
              const shareUrl = `${window.location.origin}${window.location.pathname}?photo=${photo?.id}`;
              await navigator.clipboard.writeText(shareUrl);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }}
            aria-label="Share Link"
            active={linkCopied}
            activeClass="text-green-400 border-green-400/40 bg-green-500/10"
            className="hidden sm:flex"
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </LightboxButton>

          <LightboxButton
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Toggle Info"
            active={showInfo}
          >
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </LightboxButton>

          <LightboxButton
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            active={zoomed}
            className="hidden sm:flex"
          >
            {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </LightboxButton>
          
          <LightboxButton
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            active={isFullscreen}
            className="hidden sm:flex"
          >
            <Maximize2 className="h-4 w-4" />
          </LightboxButton>
          
          <LightboxButton
            onClick={() => photo && downloadSinglePhoto(photo)}
            aria-label="Download"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </LightboxButton>
          <div className="hidden sm:block w-px h-5 bg-white/10 mx-1" />
          <LightboxButton onClick={onClose} aria-label="Close">
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </LightboxButton>
        </div>
      </motion.div>

      {/* ── Main content area with optional side panel ── */}
      <div className="flex-1 relative flex overflow-hidden min-h-0">
        
        {/* Main image container with touch gesture support */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 relative flex items-center justify-center min-h-0 select-none overflow-hidden"
        >
          {/* Nav buttons (Desktop) */}
          <button
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Previous photo"
            className={cn(
              "hidden md:flex absolute left-4 z-30 items-center justify-center w-12 h-12 rounded-full border transition-all duration-300",
              isFirst
                ? "opacity-0 pointer-events-none"
                : "border-white/10 bg-black/30 backdrop-blur-md text-white/70 hover:border-white/25 hover:bg-black/50 hover:text-white hover:scale-105"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={isLast}
            aria-label="Next photo"
            className={cn(
              "hidden md:flex absolute right-4 z-30 items-center justify-center w-12 h-12 rounded-full border transition-all duration-300",
              isLast
                ? "opacity-0 pointer-events-none"
                : "border-white/10 bg-black/30 backdrop-blur-md text-white/70 hover:border-white/25 hover:bg-black/50 hover:text-white hover:scale-105"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Mobile Tap Navigation Chevrons */}
          {!isFirst && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white/80 backdrop-blur-md border border-white/10 active:scale-90 transition-transform cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white/80 backdrop-blur-md border border-white/10 active:scale-90 transition-transform cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Photo */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if ((swipe < -200 || offset.x < -30) && !isLast) {
                  goNext();
                } else if ((swipe > 200 || offset.x > 30) && !isFirst) {
                  goPrev();
                }
              }}
              className="absolute inset-0 flex items-center justify-center p-0 sm:px-12 md:px-16"
              style={{ touchAction: "pan-y" }}
            >
              <motion.div
                animate={{ scale: zoomed ? 1.8 : 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative flex items-center justify-center w-full h-full cursor-zoom-in"
                onDoubleClick={() => setZoomed((z) => !z)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoSrc}
                  alt={photo.filename || "Gallery photo"}
                  className="w-full h-full max-h-[calc(100dvh-54px)] sm:max-h-[calc(100vh-140px)] object-contain select-none shadow-2xl transition-transform"
                  draggable={false}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (photo.drive_file_id && !target.src.includes("lh3.googleusercontent.com")) {
                      target.src = `https://lh3.googleusercontent.com/d/${photo.drive_file_id}=s1800`;
                    } else if (photo.drive_file_id && !target.src.includes("drive.google.com/thumbnail")) {
                      target.src = `https://drive.google.com/thumbnail?id=${photo.drive_file_id}&sz=w1800`;
                    } else if (photo.drive_file_id && !target.src.includes("/api/drive/photo/")) {
                      target.src = `/api/drive/photo/${photo.drive_file_id}`;
                    } else {
                      target.src = "/images/placeholder-event.jpg";
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile bottom quick actions floating pill */}
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl shadow-xl">
            <span className="text-[10px] font-mono text-white/60 mr-1">
              {current + 1} / {photos.length}
            </span>
            <button
              onClick={() => { if (photo) toggleFavorite(photo.id); }}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                isFavorite(photo?.id) ? "text-red-400" : "text-white/70"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite(photo?.id) && "fill-current")} />
            </button>
            <button
              onClick={() => photo && downloadSinglePhoto(photo)}
              className="p-1.5 rounded-full text-white/70 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Info Panel (Apple Photos style) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute bottom-0 left-0 right-0 h-[48vh] md:h-auto md:relative md:w-80 md:translate-y-0 bg-[#06030c]/95 md:bg-black/40 backdrop-blur-2xl md:backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto z-40"
            >
              <div className="p-6 w-full md:w-[320px] space-y-8 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase">Information</h3>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all md:hidden"
                    aria-label="Close Info"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
                
                {/* Photo details */}
                <div className="space-y-4">
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-center gap-3 text-white/60">
                      <Camera className="w-4 h-4 text-white/40" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/80">Camera Model</span>
                        <span className="text-xs font-mono">
                          {photo.camera_make || "Unknown"} {photo.camera_model}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/60">
                      <Aperture className="w-4 h-4 text-white/40" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/80">Lens & Settings</span>
                        <span className="text-xs font-mono text-white/70">
                          {photo.lens || "Unknown Lens"}
                          {photo.exif?.FNumber ? ` · f/${photo.exif.FNumber}` : ""}
                          {photo.exif?.ISOSpeedRatings ? ` · ISO ${photo.exif.ISOSpeedRatings}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/60">
                      <Clock className="w-4 h-4 text-white/40" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/80">Date Taken</span>
                        <span className="text-xs font-mono">
                          {photo.taken_at ? new Date(photo.taken_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute:'2-digit'
                          }) : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Views</span>
                    <span className="text-sm font-mono text-white/80">{photo.view_count?.toLocaleString() || 0}</span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Resolution</span>
                    <span className="text-sm font-mono text-white/80">{photo.width} × {photo.height}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Removed QR Modal */}

      {/* ── Thumbnail strip — macOS style magnification (hidden on mobile for maximum photo size) ── */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="hidden md:block flex-shrink-0 py-4 z-10"
        style={{ background: "linear-gradient(0deg, rgba(2,1,5,0.95) 0%, transparent 100%)" }}
      >
        <div
          ref={thumbsRef}
          className="flex items-center gap-2 px-6 overflow-x-auto scrollbar-none h-20"
          style={{ scrollPaddingInline: "24px" }}
        >
          {photos.map((p, i) => {
            const src = getPhotoDisplayUrl(p);
            const isActive = i === current;
            return (
              <motion.button
                key={p.id}
                data-active={isActive}
                onClick={() => goTo(i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{
                  scale: getScale(i),
                  opacity: getOpacity(i),
                  marginInline: getMargin(i),
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.1 }}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden focus-visible:outline-none origin-bottom",
                  isActive
                    ? "shadow-[0_10px_35px_-5px_rgba(157,94,229,0.5)] border border-cpcLight/30"
                    : "border border-white/5"
                )}
                aria-label={`View photo ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LightboxButton({
  children,
  onClick,
  "aria-label": ariaLabel,
  active,
  activeClass,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
  active?: boolean;
  activeClass?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight shrink-0 cursor-pointer",
        active
          ? activeClass ?? "border-cpcLight/50 bg-cpcPurple/20 text-white"
          : "border-white/10 bg-white/[0.05] text-white/50 hover:border-white/20 hover:bg-white/10 hover:text-white",
        disabled && "opacity-30 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
