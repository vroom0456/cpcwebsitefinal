"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverCropperModalProps {
  isOpen: boolean;
  photoUrl: string;
  eventId: string;
  onClose: () => void;
  onSaveSuccess: (newCoverUrl: string) => void;
}

type AspectRatio = "16:9" | "3:2" | "4:3" | "1:1";

const ASPECT_RATIOS: { label: string; value: AspectRatio; ratio: number }[] = [
  { label: "16:9 Banner", value: "16:9", ratio: 16 / 9 },
  { label: "3:2 Standard", value: "3:2", ratio: 3 / 2 },
  { label: "4:3 Card", value: "4:3", ratio: 4 / 3 },
  { label: "1:1 Square", value: "1:1", ratio: 1 / 1 },
];

export function CoverCropperModal({
  isOpen,
  photoUrl,
  eventId,
  onClose,
  onSaveSuccess,
}: CoverCropperModalProps) {
  const [mounted, setMounted] = useState(false);
  const [aspect, setAspect] = useState<AspectRatio>("16:9");
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cropFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number }>({ w: 1920, h: 1080 });

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine best source URL and load image as a clean same-origin Blob
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (isOpen && photoUrl) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setErrorMsg(null);
      setImageLoaded(false);

      const loadImageBlob = async () => {
        try {
          let fetchTarget = photoUrl;

          // Check if Google Drive file ID
          const driveMatch = photoUrl.match(
            /(?:file\/d\/|uc\?(?:.*&)?id=|lh3\.googleusercontent\.com\/d\/|\/api\/drive\/photo\/)([a-zA-Z0-9_-]{15,})/
          );

          if (driveMatch?.[1]) {
            fetchTarget = `/api/drive/photo/${driveMatch[1]}?sz=1920`;
          } else if (photoUrl.startsWith("http")) {
            fetchTarget = `/api/admin/proxy-image?url=${encodeURIComponent(photoUrl)}`;
          }

          const res = await fetch(fetchTarget);
          if (!res.ok) throw new Error("Could not fetch image data from server");
          const blob = await res.blob();
          createdUrl = URL.createObjectURL(blob);

          if (!active) return;

          const img = new Image();
          img.src = createdUrl;
          img.onload = () => {
            if (!active) return;
            imageRef.current = img;
            setImgNaturalSize({
              w: img.naturalWidth || 1920,
              h: img.naturalHeight || 1080,
            });
            setObjectUrl(createdUrl);
            setImageLoaded(true);
          };
          img.onerror = () => {
            if (!active) return;
            setErrorMsg("Failed to decode image data.");
          };
        } catch (err: any) {
          if (!active) return;
          setErrorMsg(err.message || "Could not load image");
        }
      };

      loadImageBlob();
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, photoUrl]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || !e.touches[0]) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Target aspect ratio float
  const targetRatio = ASPECT_RATIOS.find((r) => r.value === aspect)?.ratio || 16 / 9;

  // Compute base rendering dimensions so the image covers the crop frame
  const frameWidth = cropFrameRef.current?.clientWidth || 640;
  const frameHeight = cropFrameRef.current?.clientHeight || Math.round(640 / targetRatio);

  const imgRatio = imgNaturalSize.w / imgNaturalSize.h;
  let baseWidth = frameWidth;
  let baseHeight = frameHeight;

  if (imgRatio > targetRatio) {
    baseHeight = frameHeight;
    baseWidth = Math.round(frameHeight * imgRatio);
  } else {
    baseWidth = frameWidth;
    baseHeight = Math.round(frameWidth / imgRatio);
  }

  const handleSaveCroppedCover = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      let finalUrl = photoUrl;

      if (imageRef.current) {
        const img = imageRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const outputWidth = 1920;
          const outputHeight = Math.round(1920 / targetRatio);

          canvas.width = outputWidth;
          canvas.height = outputHeight;

          // Black matte fill
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, outputWidth, outputHeight);

          // Scaling ratio from on-screen crop box to final 1920px canvas
          const scaleFactor = outputWidth / (cropFrameRef.current?.clientWidth || frameWidth);

          ctx.save();
          ctx.translate(outputWidth / 2, outputHeight / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(zoom, zoom);
          ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

          const drawW = baseWidth * scaleFactor;
          const drawH = baseHeight * scaleFactor;
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

          ctx.restore();

          // Export canvas as JPEG blob
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
          );

          if (blob) {
            const formData = new FormData();
            formData.append("file", blob, `cover-${eventId}.jpg`);

            const res = await fetch(`/api/admin/events/${eventId}/cover`, {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || "Failed to upload cropped cover");
            }

            const data = await res.json();
            finalUrl = data.coverUrl || finalUrl;
          }
        }
      }

      onSaveSuccess(finalUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save cover photo");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 animate-fade-in select-none">
      <div className="w-full max-w-4xl glass-card border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
              <Crop size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Crop &amp; Position Cover Photo
              </h2>
              <p className="text-xs text-white/50">
                Drag to position, zoom, rotate, and select the ideal framing for live cards &amp; banners.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-300 shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Aspect Ratio Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 mr-2 flex items-center gap-1">
            <Sliders size={12} /> Aspect Ratio:
          </span>
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setAspect(item.value);
                setOffset({ x: 0, y: 0 });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                aspect === item.value
                  ? "bg-[#9D5EE5] text-white shadow-lg shadow-purple-950/50 scale-105"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Cropper Viewport Frame */}
        <div className="flex-1 min-h-[300px] sm:min-h-[420px] relative overflow-hidden rounded-2xl bg-[#060309] border border-purple-500/20 flex items-center justify-center p-4">
          <div
            ref={cropFrameRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative border-2 border-[#C084FC] shadow-[0_0_45px_rgba(192,132,252,0.4)] overflow-hidden rounded-xl bg-black cursor-grab active:cursor-grabbing select-none flex items-center justify-center transition-all duration-200"
            style={{
              width: "min(100%, 720px)",
              aspectRatio: `${targetRatio}`,
              maxHeight: "82%",
            }}
          >
            {/* The Draggable / Scalable Image */}
            {objectUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={objectUrl}
                alt="Crop preview"
                draggable={false}
                className="max-w-none pointer-events-none select-none transition-transform duration-75"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom}) rotate(${rotation}deg)`,
                  width: baseWidth,
                  height: baseHeight,
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/30 gap-2">
                <Sparkles size={24} className="animate-spin text-[#C084FC]" />
                <span className="text-xs font-mono">Preparing high-res photo canvas…</span>
              </div>
            )}

            {/* Rule of Thirds Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/15 pointer-events-none z-10">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div />
            </div>

            {/* Framing aspect tag badge */}
            <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-[#C084FC]">
              {aspect}
            </div>
          </div>
        </div>

        {/* Zoom & Rotation Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-purple-500/15 shrink-0 text-xs">
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <ZoomOut size={15} className="text-white/40" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-purple-950/60 rounded-lg appearance-none cursor-pointer accent-[#C084FC]"
            />
            <ZoomIn size={15} className="text-white/40" />
            <span className="font-mono text-white/60 w-12 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="bg-white/5 border-purple-500/30 text-white hover:text-[#C084FC] text-xs rounded-xl cursor-pointer"
            >
              <RotateCw size={14} className="mr-1.5" /> Rotate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="bg-white/5 border-white/10 text-white/60 hover:text-white text-xs rounded-xl cursor-pointer"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Modal Footer / Save */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 shrink-0">
          <p className="text-[11px] text-white/40 font-mono">
            {imgNaturalSize.w} × {imgNaturalSize.h}px source · 1920px export
          </p>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSaving || !imageLoaded}
              onClick={handleSaveCroppedCover}
              className="bg-[#9D5EE5] hover:bg-[#8A46D4] text-white font-bold text-xs px-6 rounded-xl shadow-lg shadow-purple-950/50 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Sparkles size={14} className="mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={14} className="mr-1.5" /> Set as Cover Photo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
