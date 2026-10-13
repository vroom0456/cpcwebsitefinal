"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitBuzz } from "@/lib/actions/buzz.actions";
import { extractDriveFileId, coverPhotoSrc } from "@/lib/utils";
import { Camera, Send, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, HardDrive, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const buzzSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  rollNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  email: z.string().email("Invalid email address").or(z.string().length(0)),
  driveLink: z
    .string()
    .min(5, "Please provide a link to your photo")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "Link must start with https://",
    }),
  caption: z.string().max(300, "Caption cannot exceed 300 characters").optional(),
});

type BuzzFormValues = z.infer<typeof buzzSchema>;

export default function SubmitBuzzPage() {
  const [driveLinkValue, setDriveLinkValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuzzFormValues>({
    resolver: zodResolver(buzzSchema),
  });

  const detectedDriveId = extractDriveFileId(driveLinkValue);
  const isDriveUrl = driveLinkValue.includes("drive.google.com") || driveLinkValue.includes("google.com");
  const previewImgSrc = detectedDriveId
    ? coverPhotoSrc(driveLinkValue, 800)
    : driveLinkValue.startsWith("http") && !isDriveUrl
    ? driveLinkValue
    : null;

  const onSubmit = async (values: BuzzFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData();
    formData.append("studentName", values.studentName);
    if (values.rollNumber) formData.append("rollNumber", values.rollNumber);
    if (values.instagramHandle) formData.append("instagramHandle", values.instagramHandle);
    if (values.email) formData.append("email", values.email);
    if (values.caption) formData.append("caption", values.caption);
    formData.append("driveLink", values.driveLink);

    try {
      const res = await submitBuzz(formData);
      if (res.success) {
        setSubmitStatus({ type: "success", message: res.message });
        reset();
        setDriveLinkValue("");
      } else {
        setSubmitStatus({ type: "error", message: res.message });
      }
    } catch {
      setSubmitStatus({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] pt-28 pb-20 flex items-center justify-center relative">
      <div className="w-full max-w-xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-3 mb-8">
          <p className="text-[11px] font-semibold tracking-[0.45em] uppercase text-white/50">
            Submit Your Frame
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Buzz Submissions
          </h1>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Submit your campus snapshots, aesthetic moments, or event frames. Selected entries are featured in the club&apos;s public galleries.
          </p>
        </div>

        {submitStatus && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              submitStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                : "bg-red-500/10 border-red-500/25 text-red-300"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            )}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">
                {submitStatus.type === "success" ? "Submission Received" : "Error"}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">{submitStatus.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Quality Notice & Drive Link Input */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="flex items-start gap-2.5">
              <HardDrive className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white/90">
                  Full Original Quality via Google Drive
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Upload your high-resolution frame to your Google Drive, set sharing to{" "}
                  <span className="text-white/80 font-medium">Anyone with the link can view</span>, and paste the link below. No compression or quality loss.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
                Google Drive Photo Link *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                {...register("driveLink", {
                  onChange: (e) => setDriveLinkValue(e.target.value.trim()),
                })}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 focus:bg-black/60 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
              {errors.driveLink && (
                <p className="text-[11px] text-red-400 font-medium">{errors.driveLink.message}</p>
              )}
            </div>

            {/* Live Preview if Drive ID or image link is detected */}
            {previewImgSrc ? (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 size={12} />
                    Valid Link Detected
                  </span>
                  <a
                    href={driveLinkValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                  >
                    Open original <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative w-full h-52 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                  <Image
                    src={previewImgSrc}
                    alt="Submission Preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>
            ) : driveLinkValue && isDriveUrl ? (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                <span className="flex items-center gap-1.5 text-white/70">
                  <Info size={12} />
                  Drive Folder or Link registered
                </span>
                <a
                  href={driveLinkValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                >
                  Verify Link <ExternalLink size={10} />
                </a>
              </div>
            ) : null}
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Student Name"
                {...register("studentName")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
              {errors.studentName && (
                <p className="text-[11px] text-red-400 font-medium">{errors.studentName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
                Roll Number / Dept
              </label>
              <input
                type="text"
                placeholder="160122733000"
                {...register("rollNumber")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
                Instagram Handle
              </label>
              <input
                type="text"
                placeholder="@username"
                {...register("instagramHandle")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@cbit.ac.in"
                {...register("email")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block">
              Caption / Story
            </label>
            <textarea
              placeholder="Camera model, setting, or moment details..."
              {...register("caption")}
              disabled={isSubmitting}
              rows={3}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/30 resize-none transition-all placeholder:text-white/20"
            />
            {errors.caption && (
              <p className="text-[11px] text-red-400 font-medium">{errors.caption.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Submitting Frame...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Frame
              </>
            )}
          </button>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/50">
              Need full official media coverage for an upcoming club or department event?{" "}
              <Link href="/coverage" className="text-white hover:underline font-medium transition-colors">
                Request Event Coverage
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
