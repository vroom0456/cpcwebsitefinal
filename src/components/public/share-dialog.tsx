"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Link2, X, Download, Camera, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cleanEventTitle } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function loadLogoImage(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/logo.png";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

export function ShareDialog({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullScreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const displayTitle = cleanEventTitle(title);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullScreenMode) setFullScreenMode(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, fullScreenMode]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  // Download High-Resolution Square Branded QR Card
  async function handleDownloadQR() {
    const srcCanvas = canvasRef.current || fullScreenCanvasRef.current;
    if (!srcCanvas) return;
    try {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 1000;
      outCanvas.height = 1000;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) return;

      // Solid pitch black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1000, 1000);

      // Subtle violet ambient rim glow
      const glow = ctx.createRadialGradient(500, 500, 300, 500, 500, 500);
      glow.addColorStop(0, "rgba(157, 94, 229, 0.12)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1000, 1000);

      // Draw Centered QR Code
      const qrSize = 620;
      const qrX = (1000 - qrSize) / 2;
      const qrY = (1000 - qrSize) / 2;
      ctx.drawImage(srcCanvas, qrX, qrY, qrSize, qrSize);

      const a = document.createElement("a");
      const slug = (title || "gallery")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      a.download = `cpc-qr-${slug || "event"}.png`;
      a.href = outCanvas.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code", err);
    }
  }

  return (
    <AnimatePresence>
      {/* ── Fullscreen Phone Scanner Mode ── */}
      {fullScreenMode ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 select-none cursor-pointer"
          onClick={() => setFullScreenMode(false)}
        >
          {/* Top Controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/50 z-20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase text-white/70">{displayTitle}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenMode(false);
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Exit Fullscreen"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>

          {/* Centered QR Code */}
          <div className="relative p-2 bg-black flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <QRCodeCanvas
                ref={fullScreenCanvasRef}
                value={url}
                size={340}
                level="H"
                bgColor="#000000"
                fgColor="#FFFFFF"
                marginSize={2}
                imageSettings={{
                  src: "/images/logo.png",
                  height: 74,
                  width: 74,
                  excavate: true,
                  crossOrigin: "anonymous",
                }}
                className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]"
              />

              {/* Circular White Aperture Ring */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/90 shadow-md"
                style={{ width: "56px", height: "56px" }}
              />
            </div>
          </div>

          {/* Bottom Tap to Dismiss indicator */}
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-1.5 text-white/40 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white/60">
              <Camera className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>Point camera to scan</span>
            </span>
            <span className="text-[11px] text-white/30">Tap anywhere to exit full screen</span>
          </div>
        </motion.div>
      ) : (
        /* ── Standard Centered Share Modal ── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-2xl border border-white/[0.1] bg-[#0A0515]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-white/[0.06]">
              <div className="min-w-0 pr-3">
                <h2 id="share-dialog-title" className="text-sm font-bold text-white font-display tracking-tight">
                  Share Event
                </h2>
                <p className="text-[11px] text-white/45 mt-0.5 truncate font-mono">{displayTitle}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFullScreenMode(true)}
                  aria-label="Full screen QR code"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
                  title="Full Screen Scanner Mode"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
                <button
                  ref={closeButtonRef}
                  aria-label="Close share dialog"
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 pt-4 space-y-4">
              {/* QR Code Presentation */}
              <div className="flex flex-col items-center">
                <div className="relative p-3 rounded-xl bg-black border border-white/[0.1] shadow-xl flex flex-col items-center">
                  <div className="relative">
                    <QRCodeCanvas
                      ref={canvasRef}
                      value={url}
                      size={200}
                      level="H"
                      bgColor="#000000"
                      fgColor="#FFFFFF"
                      marginSize={2}
                      imageSettings={{
                        src: "/images/logo.png",
                        height: 48,
                        width: 48,
                        excavate: true,
                        crossOrigin: "anonymous",
                      }}
                      className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] rounded"
                    />

                    {/* Circular White Aperture Ring */}
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/90 shadow-md"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                </div>

                {/* Helper info */}
                <div className="flex items-center justify-between w-full mt-2.5 px-0.5 text-[11px] font-mono">
                  <p className="flex items-center gap-1.5 text-white/45">
                    <Camera className="h-3 w-3 text-[#C084FC]" />
                    <span>Point camera to scan</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setFullScreenMode(true)}
                    className="text-white/60 hover:text-[#C084FC] transition-colors flex items-center gap-1 text-[10.5px]"
                  >
                    <Maximize2 className="h-2.5 w-2.5" />
                    <span>Expand</span>
                  </button>
                </div>
              </div>

              {/* Link preview box */}
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <span className="flex-1 truncate font-mono text-[11px] text-white/60 select-all">{url}</span>
              </div>

              {/* Action Buttons: Copy Link & Download QR */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white text-xs font-medium transition-all active:scale-[0.98]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/70" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#7032B5] hover:bg-[#8338D2] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download QR</span>
                </button>
              </div>

              {/* Native share if available on mobile */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => navigator.share?.({ title: displayTitle, url }).catch(() => {})}
                  className="w-full text-center text-[10.5px] font-medium tracking-wider uppercase text-white/35 hover:text-white/65 transition-colors pt-0.5"
                >
                  More share options…
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
