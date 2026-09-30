"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Link2, X, QrCode, Download, Camera, Maximize2, Minimize2, Sparkles } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"qr" | "link">("qr");
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
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Download Square (1:1) Branded PNG Card
  async function handleDownloadSquare() {
    const srcCanvas = canvasRef.current || fullScreenCanvasRef.current;
    if (!srcCanvas) return;
    try {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 1000;
      outCanvas.height = 1000;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) return;

      // Pure pitch-black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1000, 1000);

      // Subtle violet ambient rim glow
      const glow = ctx.createRadialGradient(500, 500, 300, 500, 500, 500);
      glow.addColorStop(0, "rgba(157, 94, 229, 0.08)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1000, 1000);

      // Draw Header Logo + Stacked Text Lockup
      const logoImg = await loadLogoImage();
      const lockupY = 90;
      const logoSize = 64;
      const textGap = 18;
      const textWidth = 140;
      const totalLockupWidth = logoSize + textGap + textWidth;
      const startX = (1000 - totalLockupWidth) / 2;

      if (logoImg) {
        ctx.drawImage(logoImg, startX, lockupY, logoSize, logoSize);
      }

      // Draw Stacked Text ("CBIT", "PHOTO", "CLUB")
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "0.45em";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const textX = startX + logoSize + textGap;
      ctx.fillText("CBIT", textX, lockupY + 14);
      ctx.fillText("PHOTO", textX, lockupY + 32);
      ctx.fillText("CLUB", textX, lockupY + 50);

      // Draw Centered QR Code
      const qrSize = 520;
      const qrX = (1000 - qrSize) / 2;
      const qrY = 220;
      ctx.drawImage(srcCanvas, qrX, qrY, qrSize, qrSize);

      // Event title & bottom instructions
      ctx.letterSpacing = "0.15em";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((displayTitle || "OFFICIAL ARCHIVE").toUpperCase(), 500, 800);

      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "0.25em";
      ctx.fillText("POINT CAMERA TO SCAN & BROWSE FULL GALLERY", 500, 835);

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
      console.error("Failed to download square QR code", err);
    }
  }

  // Download Mobile Story / Poster (9:16 Portrait matching reference layout)
  async function handleDownloadStory() {
    const srcCanvas = canvasRef.current || fullScreenCanvasRef.current;
    if (!srcCanvas) return;
    try {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 1080;
      outCanvas.height = 1920;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) return;

      // Pure solid pitch black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle violet ambient glow
      const glow = ctx.createRadialGradient(540, 960, 400, 540, 960, 800);
      glow.addColorStop(0, "rgba(157, 94, 229, 0.12)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw Header Logo + Stacked Text Lockup above QR
      const logoImg = await loadLogoImage();
      const qrSize = 640;
      const qrX = (1080 - qrSize) / 2;
      const qrY = (1920 - qrSize) / 2 - 30;

      const logoSize = 88;
      const textGap = 24;
      const textWidth = 180;
      const totalLockupWidth = logoSize + textGap + textWidth;
      const startX = (1080 - totalLockupWidth) / 2;
      const lockupY = qrY - 170;

      if (logoImg) {
        ctx.drawImage(logoImg, startX, lockupY, logoSize, logoSize);
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "0.45em";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const textX = startX + logoSize + textGap;
      ctx.fillText("CBIT", textX, lockupY + 18);
      ctx.fillText("PHOTO", textX, lockupY + 44);
      ctx.fillText("CLUB", textX, lockupY + 70);

      // Centered QR Code
      ctx.drawImage(srcCanvas, qrX, qrY, qrSize, qrSize);

      // Event title & caption below QR
      ctx.letterSpacing = "0.15em";
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((displayTitle || "OFFICIAL ARCHIVE").toUpperCase(), 540, qrY + qrSize + 110);

      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "0.25em";
      ctx.fillText("POINT CAMERA TO SCAN & ACCESS ARCHIVE", 540, qrY + qrSize + 155);

      const slug = (title || "gallery")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const a = document.createElement("a");
      a.download = `cpc-story-qr-${slug}.png`;
      a.href = outCanvas.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download story QR code", err);
    }
  }

  return (
    <AnimatePresence>
      {/* ── Fullscreen Phone Scanner Mode (Matches Reference Photo 1:1) ── */}
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
              <span className="w-2 h-2 rounded-full bg-[#9D5EE5] animate-pulse" />
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

          {/* Centered QR Code with Official Header Logo + Text Lockup beside it */}
          <div className="relative p-4 bg-black flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Header Brand Lockup */}
            <div className="flex items-center justify-center gap-3.5 mb-6 select-none">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="CBIT Photo Club Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center text-left leading-[1.25] font-bold tracking-[0.45em] text-[13px] text-white uppercase font-display">
                <span>CBIT</span>
                <span>Photo</span>
                <span>Club</span>
              </div>
            </div>

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

              {/* Circular White Aperture Ring matching reference photo exactly */}
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
            className="w-full max-w-[400px] rounded-[1.75rem] border border-white/[0.1] bg-[#07040F] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="min-w-0 pr-3">
                <h2 id="share-dialog-title" className="text-[15px] font-bold text-[#F8F5FB] font-display">
                  Share Gallery
                </h2>
                <p className="text-[11px] text-[#F8F5FB]/40 mt-0.5 truncate font-mono">{displayTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFullScreenMode(true)}
                  aria-label="Full screen QR code"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#F8F5FB]/50 hover:text-[#F8F5FB] hover:bg-white/[0.08] transition-all duration-200 shrink-0"
                  title="Full Screen Scanner Mode"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  ref={closeButtonRef}
                  aria-label="Close share dialog"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#F8F5FB]/50 hover:text-[#F8F5FB] hover:bg-white/[0.08] transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D5EE5]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-6 pt-4 pb-1">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "qr"
                      ? "bg-[#9D5EE5] text-white shadow-md"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "link"
                      ? "bg-[#9D5EE5] text-white shadow-md"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Gallery Link</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-3 space-y-4">
              {activeTab === "qr" ? (
                <div className="flex flex-col items-center">
                  {/* Branded Dark QR Card with centered Camera Mode Dial logo and Official Header Lockup */}
                  <div className="relative p-5 rounded-2xl bg-black border border-white/[0.12] shadow-2xl flex flex-col items-center">
                    {/* Header Brand Lockup */}
                    <div className="flex items-center justify-center gap-3 mb-3.5 select-none">
                      <div className="relative w-8 h-8 shrink-0">
                        <Image
                          src="/images/logo.png"
                          alt="CBIT Photo Club Logo"
                          width={32}
                          height={32}
                          className="object-contain"
                          priority
                        />
                      </div>
                      <div className="flex flex-col justify-center text-left leading-[1.25] font-bold tracking-[0.45em] text-[11px] text-white uppercase font-display">
                        <span>CBIT</span>
                        <span>Photo</span>
                        <span>Club</span>
                      </div>
                    </div>

                    <div className="relative">
                      <QRCodeCanvas
                        ref={canvasRef}
                        value={url}
                        size={280}
                        level="H"
                        bgColor="#000000"
                        fgColor="#FFFFFF"
                        marginSize={2}
                        imageSettings={{
                          src: "/images/logo.png",
                          height: 60,
                          width: 60,
                          excavate: true,
                          crossOrigin: "anonymous",
                        }}
                        className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-lg"
                      />

                      {/* Circular White Aperture Ring matching reference photo exactly */}
                      <div
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/90 shadow-md"
                        style={{ width: "48px", height: "48px" }}
                      />
                    </div>
                  </div>

                  {/* Camera Scan Helper */}
                  <div className="flex items-center justify-between w-full mt-3 px-1 text-[11px] font-mono">
                    <p className="flex items-center gap-1.5 text-white/50">
                      <Camera className="h-3 w-3 text-[#C084FC]" />
                      <span>Point camera to open</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setFullScreenMode(true)}
                      className="text-[#C084FC] hover:text-white transition-colors flex items-center gap-1 text-[10.5px]"
                    >
                      <Maximize2 className="h-2.5 w-2.5" />
                      <span>Full screen</span>
                    </button>
                  </div>

                  {/* QR Actions: Save Story (9:16) + Save Square (1:1) + Copy */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-3.5">
                    <button
                      type="button"
                      onClick={handleDownloadStory}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white py-2.5 px-3 text-xs font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                      title="Download 9:16 mobile wallpaper / story matching photo"
                    >
                      <Download className="h-3.5 w-3.5 text-[#C084FC]" />
                      <span>Save Story (9:16)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSquare}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white py-2.5 px-3 text-xs font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                      title="Download square QR PNG"
                    >
                      <Download className="h-3.5 w-3.5 text-white/70" />
                      <span>Save Square</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#9D5EE5] hover:bg-[#A86DF0] text-white py-2.5 px-3 text-xs font-semibold tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-purple-950/40"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Link Copied!" : "Copy Gallery Link"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* URL preview box */}
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Direct URL</span>
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-[#C084FC]" />
                      <span className="flex-1 truncate text-xs text-white/70 font-mono select-all">{url}</span>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-xs font-bold tracking-wider uppercase transition-all hover:bg-[#E8D1FF] hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Link Copied to Clipboard!" : "Copy Share Link"}</span>
                  </button>
                </div>
              )}

              {/* Native share if available */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => navigator.share?.({ title: displayTitle, url }).catch(() => {})}
                  className="w-full text-center text-[11px] font-semibold tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors pt-1"
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
