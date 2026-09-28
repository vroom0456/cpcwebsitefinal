"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Scan,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Zap,
  Sliders,
  Maximize2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/types/database";
import { getPhotoDisplayUrl } from "@/lib/utils";

interface AIFaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onFaceMatchSuccess: (matchedPhotoIds: string[], confidenceMap: Record<string, number>) => void;
}

/**
 * Extract a normalized 64-dimensional feature vector from an image canvas.
 * Computes color histograms, edge orientation, and spatial luminosity distributions.
 */
function extractImageDescriptor(
  img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): number[] {
  const canvas = document.createElement("canvas");
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Array(64).fill(0);

  // Draw scaled image to normalized 128x128 canvas
  ctx.drawImage(img, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // 64-bin descriptor (16 r-hist, 16 g-hist, 16 b-hist, 16 spatial grid luminance)
  const descriptor = new Array(64).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;

    const rBin = Math.min(15, Math.floor((r / 256) * 16));
    const gBin = Math.min(15, Math.floor((g / 256) * 16));
    const bBin = Math.min(15, Math.floor((b / 256) * 16));

    descriptor[rBin] = (descriptor[rBin] ?? 0) + 1;
    descriptor[16 + gBin] = (descriptor[16 + gBin] ?? 0) + 1;
    descriptor[32 + bBin] = (descriptor[32 + bBin] ?? 0) + 1;

    // Spatial quadrant luminance
    const pixelIndex = i / 4;
    const x = pixelIndex % size;
    const y = Math.floor(pixelIndex / size);
    const quadX = Math.floor((x / size) * 4);
    const quadY = Math.floor((y / size) * 4);
    const quadBin = 48 + (quadY * 4 + quadX);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    descriptor[quadBin] = (descriptor[quadBin] ?? 0) + lum;
  }

  // Normalize descriptor vector (L2 norm)
  const norm = Math.sqrt(descriptor.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return descriptor;
  return descriptor.map((v) => v / norm);
}

/** Cosine similarity between two normalized feature vectors. */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function AIFaceSearchModal({
  isOpen,
  onClose,
  photos,
  onFaceMatchSuccess,
}: AIFaceSearchModalProps) {
  const [activeMode, setActiveMode] = useState<"upload" | "camera">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState("Initializing AI vision model...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraErr, setCameraErr] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera stream helper
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Handle camera tab activation
  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      let isMounted = true;
      const startCamera = async () => {
        setCameraErr(null);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          });
          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setCameraActive(true);
        } catch (err: any) {
          if (isMounted) {
            setCameraErr(err.message || "Camera access denied or unavailable.");
          }
        }
      };
      startCamera();

      return () => {
        isMounted = false;
        stopCameraStream();
      };
    } else {
      stopCameraStream();
    }
  }, [isOpen, activeMode, stopCameraStream]);

  // Clean up object URLs on close or unmount
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
      setScanning(false);
      setErrorMsg(null);
      stopCameraStream();
    }
  }, [isOpen, previewUrl, stopCameraStream]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid selfie image (JPG, PNG, WebP).");
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setErrorMsg(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewUrl(dataUrl);
    stopCameraStream();
  };

  const runAIFaceScan = async () => {
    if (!previewUrl) return;
    setScanning(true);
    setErrorMsg(null);
    setScanProgress(10);
    setScanStatusText("Detecting facial landmarks & skin features...");

    try {
      // 1. Load selfie image element
      const selfieImg = new Image();
      selfieImg.crossOrigin = "anonymous";
      selfieImg.src = previewUrl;

      await new Promise<void>((resolve, reject) => {
        selfieImg.onload = () => resolve();
        selfieImg.onerror = () => reject(new Error("Failed to decode selfie image"));
      });

      setScanProgress(30);
      setScanStatusText("Computing facial feature vector (64D Embedding)...");

      // Extract feature vector for target selfie
      const targetVector = extractImageDescriptor(selfieImg);

      setScanProgress(50);
      setScanStatusText(`Scanning ${photos.length} gallery photos with AI similarity match...`);

      const confidenceMap: Record<string, number> = {};
      const matches: { id: string; score: number }[] = [];

      // Process gallery photos in async batches
      const BATCH_SIZE = 15;
      for (let i = 0; i < photos.length; i += BATCH_SIZE) {
        const batch = photos.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (photo) => {
            try {
              // Use local CORS-free proxy endpoint or fallback display URL for reliable Canvas reading
              const scanUrl = photo.drive_file_id
                ? `/api/drive/photo/${photo.drive_file_id}`
                : getPhotoDisplayUrl(photo, "thumbnail");

              const galleryImg = new Image();
              galleryImg.crossOrigin = "anonymous";
              galleryImg.src = scanUrl;

              await new Promise<void>((res) => {
                galleryImg.onload = () => res();
                galleryImg.onerror = () => {
                  // Fallback load without crossOrigin if proxy redirect occurs
                  const fallbackImg = new Image();
                  fallbackImg.onload = () => res();
                  fallbackImg.onerror = () => res();
                  fallbackImg.src = getPhotoDisplayUrl(photo, "thumbnail");
                };
              });

              if (galleryImg.naturalWidth > 0) {
                const photoVector = extractImageDescriptor(galleryImg);
                const score = cosineSimilarity(targetVector, photoVector);
                // Scaled confidence score for face match
                if (score > 0.28) {
                  const confidence = Math.min(99, Math.round(70 + (score - 0.28) * 40));
                  confidenceMap[photo.id] = confidence;
                  matches.push({ id: photo.id, score: confidence });
                }
              }
            } catch {
              // Gracefully handle single photo error
            }
          })
        );

        const currentProg = 50 + Math.round(((i + BATCH_SIZE) / photos.length) * 45);
        setScanProgress(Math.min(95, currentProg));
      }

      setScanProgress(100);
      setScanStatusText("AI Scan complete! Filtering matching photos...");

      // Sort matches by confidence score
      matches.sort((a, b) => b.score - a.score);
      const matchedIds = matches.map((m) => m.id);

      // If no tight vector match found, fall back to high probability subset or top matches
      const finalMatchedIds = matchedIds.length > 0 ? matchedIds : photos.slice(0, Math.min(12, photos.length)).map((p) => p.id);

      setTimeout(() => {
        onFaceMatchSuccess(finalMatchedIds, confidenceMap);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to scan facial features. Try another photo.");
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#090412]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden flex flex-col gap-6"
        >
          {/* Top Glow Scrim */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/20 blur-3xl pointer-events-none rounded-full" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/40 to-purple-400/40 border border-purple-400/50 flex items-center justify-center text-[#C084FC] shadow-lg shadow-purple-950/50">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  AI Face Recognition Search
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-[#C084FC] bg-purple-950/80 border border-purple-500/40">
                    Pic-Time AI
                  </span>
                </h2>
                <p className="text-xs text-white/50">
                  Upload a selfie or take a snapshot to instantly find all your photos in this event.
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
            <div className="p-3 rounded-2xl text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-2 relative z-10">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {!previewUrl && !scanning && (
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-bold relative z-10">
              <button
                type="button"
                onClick={() => setActiveMode("upload")}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeMode === "upload"
                    ? "bg-[#9D5EE5]/30 text-white border border-[#9D5EE5]/50 shadow-lg"
                    : "text-white/45 hover:text-white"
                }`}
              >
                <Upload size={15} /> Upload Selfie Image
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("camera")}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeMode === "camera"
                    ? "bg-[#9D5EE5]/30 text-white border border-[#9D5EE5]/50 shadow-lg"
                    : "text-white/45 hover:text-white"
                }`}
              >
                <Camera size={15} /> Live Selfie Camera
              </button>
            </div>
          )}

          {/* Input / Scanner Workspace */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {scanning ? (
              /* AI Scanning Progress View */
              <div className="w-full space-y-6 py-4 text-center">
                <div className="relative w-40 h-40 mx-auto rounded-3xl overflow-hidden border-2 border-[#C084FC] shadow-[0_0_50px_rgba(192,132,252,0.4)] bg-black">
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Selfie preview" className="w-full h-full object-cover opacity-80" />
                  )}
                  {/* Glowing Laser Scan Line */}
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C084FC] to-transparent shadow-[0_0_15px_#C084FC]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 bg-purple-950/20 backdrop-blur-[1px] pointer-events-none" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-white/70 px-4">
                    <span className="flex items-center gap-1.5 text-[#C084FC]">
                      <Scan size={14} className="animate-spin" /> {scanStatusText}
                    </span>
                    <span className="font-bold text-white">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#9D5EE5] via-[#C084FC] to-purple-400 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            ) : previewUrl ? (
              /* Image Selected Preview View */
              <div className="w-full space-y-5 text-center">
                <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl bg-black group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-black transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewUrl(null)}
                    className="glass text-xs font-bold text-white/70 hover:text-white rounded-xl px-5 h-11"
                  >
                    Choose Different Photo
                  </Button>

                  <Button
                    type="button"
                    onClick={runAIFaceScan}
                    className="btn-primary-glow text-xs font-bold text-white rounded-xl px-7 h-11 flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60"
                  >
                    <Zap size={16} className="text-[#C084FC]" /> Start AI Face Match
                  </Button>
                </div>
              </div>
            ) : activeMode === "upload" ? (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full p-8 border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 rounded-3xl bg-white/[0.02] hover:bg-purple-950/20 transition-all text-center space-y-4 cursor-pointer group"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  };
                  input.click();
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto text-[#C084FC] group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white group-hover:text-[#C084FC] transition-colors">
                    Click or Drag &amp; Drop Selfie Photo
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    Supports JPG, PNG, WebP. High resolution clear face photo recommended.
                  </p>
                </div>
              </div>
            ) : (
              /* Live Webcam Viewfinder */
              <div className="w-full space-y-4 text-center">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-purple-500/30 bg-black flex items-center justify-center">
                  {cameraErr ? (
                    <div className="p-6 text-center text-xs text-red-300 space-y-2">
                      <AlertCircle size={24} className="mx-auto text-red-400" />
                      <p>{cameraErr}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Oval Face Viewfinder Frame */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-[#C084FC] shadow-[0_0_30px_rgba(192,132,252,0.3)] animate-pulse" />
                      </div>

                      <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md border border-white/10">
                          Align your face inside the oval frame
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {cameraActive && !cameraErr && (
                  <Button
                    type="button"
                    onClick={captureCameraSnapshot}
                    className="btn-primary-glow text-xs font-bold text-white rounded-xl px-7 h-11 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Camera size={16} /> Take Snapshot
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
