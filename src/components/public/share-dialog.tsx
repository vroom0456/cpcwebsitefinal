"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Link2, X, QrCode, Download, Camera, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cleanEventTitle } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ShareDialog({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "link">("qr");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const displayTitle = cleanEventTitle(title);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQR() {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      const slug = (title || "gallery")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      a.download = `cpc-qr-${slug || "event"}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code", err);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
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
          className="w-full max-w-[390px] rounded-[1.75rem] border border-white/[0.1] bg-[#07040F] shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="min-w-0 pr-3">
              <h2 id="share-dialog-title" className="text-[15px] font-bold text-[#F8F5FB] font-display">
                Share Gallery
              </h2>
              <p className="text-[11px] text-[#F8F5FB]/40 mt-0.5 truncate font-mono">{displayTitle}</p>
            </div>
            <button
              ref={closeButtonRef}
              aria-label="Close share dialog"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#F8F5FB]/50 hover:text-[#F8F5FB] hover:bg-white/[0.08] transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D5EE5]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
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
                {/* Branded Dark QR Card with centered Camera Mode Dial logo */}
                <div className="relative p-3.5 rounded-2xl bg-black border border-white/[0.12] shadow-2xl flex flex-col items-center">
                  <QRCodeCanvas
                    ref={canvasRef}
                    value={url}
                    size={260}
                    level="H"
                    bgColor="#000000"
                    fgColor="#FFFFFF"
                    marginSize={2}
                    imageSettings={{
                      src: "/images/logo.png",
                      height: 56,
                      width: 56,
                      excavate: true,
                      crossOrigin: "anonymous",
                    }}
                    className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-lg"
                  />
                  
                  {/* Subtle Aperture Lens Ring Overlay for aesthetic precision */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.08]" />
                </div>

                {/* Camera Scan Helper */}
                <p className="flex items-center gap-1.5 text-[11px] text-white/50 mt-3 font-mono">
                  <Camera className="h-3 w-3 text-[#C084FC]" />
                  <span>Scan with any camera app to open</span>
                </p>

                {/* QR Actions: Download QR + Copy Link */}
                <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white py-2.5 px-3 text-xs font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="h-3.5 w-3.5 text-[#C084FC]" />
                    <span>Save QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#9D5EE5] hover:bg-[#A86DF0] text-white py-2.5 px-3 text-xs font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-950/40"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
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
    </AnimatePresence>
  );
}
