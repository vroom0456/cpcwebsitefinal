"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Sparkles, Image as ImageIcon, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { setEventCoverPhoto } from "@/lib/actions/events.actions";

interface CoverCropperModalProps {
  isOpen: boolean;
  photoUrl: string;
  eventId: string;
  onClose: () => void;
  onSaveSuccess: (newCoverUrl: string) => void;
}

type AspectRatio = "16:9" | "3:2" | "4:3" | "1:1" | "free";

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
  const [aspect, setAspect] = useState<AspectRatio>("16:9");
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Load image via Blob Object URL to ensure CORS-free Canvas operations
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
          // Determine best source URL (direct or API proxy if drive ID exists)
          const driveMatch = photoUrl.match(/(?:file\/d\/|uc\?(?:.*&)?id=|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/);
          const fetchTarget = driveMatch?.[1] ? `/api/drive/photo/${driveMatch[1]}` : photoUrl;

          const res = await fetch(fetchTarget);
          if (!res.ok) throw new Error("Failed to fetch image blob");
          const blob = await res.blob();
          createdUrl = URL.createObjectURL(blob);

          if (!active) return;

          const img = new Image();
          img.src = createdUrl;
          img.onload = () => {
            if (!active) return;
            imageRef.current = img;
            setObjectUrl(createdUrl);
            setImageLoaded(true);
          };
          img.onerror = () => {
            if (!active) return;
            // Fallback load direct image tag
            const directImg = new Image();
            directImg.crossOrigin = "anonymous";
            directImg.src = photoUrl;
            directImg.onload = () => {
              if (!active) return;
              imageRef.current = directImg;
              setImageLoaded(true);
            };
          };
        } catch {
          if (!active) return;
          const directImg = new Image();
          directImg.crossOrigin = "anonymous";
          directImg.src = photoUrl;
          directImg.onload = () => {
            if (!active) return;
            imageRef.current = directImg;
            setImageLoaded(true);
          };
          directImg.onerror = () => {
            if (!active) return;
            setImageLoaded(true); // Allow fallback save
          };
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

          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, outputWidth, outputHeight);

          ctx.save();
          ctx.translate(outputWidth / 2, outputHeight / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(zoom, zoom);

          const containerWidth = containerRef.current?.clientWidth || 600;
          const containerHeight = containerRef.current?.clientHeight || 350;
          const scaleX = outputWidth / containerWidth;
          const scaleY = outputHeight / containerHeight;

          ctx.translate(offset.x * scaleX, offset.y * scaleY);

          const drawWidth = outputWidth;
          const drawHeight = (img.naturalHeight / img.naturalWidth) * outputWidth;
          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

          ctx.restore();

          // Try to upload to Supabase Storage
          try {
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
            );

            if (blob) {
              const supabase = createClient();
              const filename = `cropped-cover-${eventId}-${Date.now()}.jpg`;

              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from("covers")
                .upload(filename, blob, {
                  contentType: "image/jpeg",
                  upsert: true,
                });

              if (!uploadErr && uploadData?.path) {
                const { data: publicUrlData } = supabase.storage.from("covers").getPublicUrl(uploadData.path);
                if (publicUrlData?.publicUrl) {
                  finalUrl = publicUrlData.publicUrl;
                }
              } else {
                finalUrl = canvas.toDataURL("image/jpeg", 0.85);
              }
            }
          } catch {
            // Fallback to data URL
            finalUrl = canvas.toDataURL("image/jpeg", 0.85);
          }
        }
      }

      // Save cover photo URL in database
      await setEventCoverPhoto(eventId, finalUrl);

      onSaveSuccess(finalUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save cover photo");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-4xl glass-card border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl glass-purple text-[#C084FC]">
              <Crop size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                Crop &amp; Position Cover Photo
              </h2>
              <p className="text-xs text-white/50">
                Drag to center, zoom, or select custom aspect ratio presets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full glass text-white/50 hover:text-white hover:border-purple-500/40 transition-colors"
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
              onClick={() => setAspect(item.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                aspect === item.value
                  ? "glass-purple border-purple-500/50 text-white shadow-lg"
                  : "glass text-white/50 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Cropper Interactive Canvas Container */}
        <div className="flex-1 min-h-[300px] sm:min-h-[400px] relative overflow-hidden rounded-2xl bg-black border border-purple-500/20 flex items-center justify-center">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center select-none"
          >
            {/* Background blur container */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundImage: `url(${photoUrl})` }}
            />

            {/* Target Crop Framing Box Overlay */}
            <div
              className="relative border-2 border-[#C084FC] shadow-[0_0_30px_rgba(192,132,252,0.4)] overflow-hidden transition-all duration-300 pointer-events-none z-10"
              style={{
                width: "90%",
                maxHeight: "85%",
                aspectRatio: `${targetRatio}`,
              }}
            >
              {/* Rule of Thirds Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/10 pointer-events-none">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>
            </div>

            {/* Transformable Image Layer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={objectUrl || photoUrl}
              alt="Cover preview"
              className="absolute max-w-none pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                width: "85%",
                height: "auto",
              }}
            />
          </div>
        </div>

        {/* Zoom & Rotation Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass border border-purple-500/15 shrink-0 text-xs">
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
              className="glass border-purple-500/30 text-white hover:text-[#C084FC] text-xs rounded-xl"
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
              className="glass border-purple-500/20 text-white/50 hover:text-white text-xs rounded-xl"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-purple-500/20 pt-4 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="glass text-white/60 hover:text-white text-xs rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveCroppedCover}
            disabled={isSaving}
            className="btn-primary-glow text-white font-bold text-xs rounded-xl px-6 cursor-pointer"
          >
            {isSaving ? "Saving Cropped Cover..." : "Apply & Save Cover Photo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
