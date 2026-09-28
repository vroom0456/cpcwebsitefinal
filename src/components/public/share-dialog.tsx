"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Link2, X, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ShareDialog({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
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
          className="w-full max-w-sm rounded-[1.75rem] border border-white/[0.07] bg-[#07040F] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.05]">
            <div>
              <h2 id="share-dialog-title" className="text-[15px] font-bold text-[#F8F5FB]">
                Share Gallery
              </h2>
              <p className="text-[12px] text-[#F8F5FB]/35 mt-0.5 line-clamp-1">{title}</p>
            </div>
            <button
              ref={closeButtonRef}
              aria-label="Close share dialog"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] text-[#F8F5FB]/40 hover:text-[#F8F5FB] hover:bg-white/[0.08] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cpcLight"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* URL row */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-cpcLight/50" aria-hidden="true" />
              <span className="flex-1 truncate text-[12px] text-[#F8F5FB]/55 font-mono">{url}</span>
            </div>

            {/* QR Code toggle */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center py-2"
                >
                  <div className="rounded-xl bg-white p-3">
                    <QRCodeSVG value={url} size={160} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleCopy}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-[12px] font-bold tracking-wider uppercase overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </span>
                <div className="absolute inset-0 bg-[#E8D1FF] translate-y-[100%] transition-transform duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
              </button>
              <button
                onClick={() => setShowQR(v => !v)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border py-3 text-[12px] font-bold tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  showQR
                    ? "bg-cpcPurple/20 border-cpcLight/40 text-cpcLight"
                    : "border-white/[0.08] bg-white/[0.03] text-[#F8F5FB]/55 hover:border-white/20 hover:text-white"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </button>
            </div>

            {/* Native share if available */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={() => navigator.share?.({ title, url }).catch(() => {})}
                className="w-full text-center text-[11px] font-semibold tracking-widest uppercase text-[#F8F5FB]/30 hover:text-[#F8F5FB]/60 transition-colors py-1"
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
