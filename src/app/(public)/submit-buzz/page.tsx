"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitBuzz } from "@/lib/actions/buzz.actions";
import { Upload, Camera, Send, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const buzzSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  rollNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  email: z.string().email("Invalid email address").or(z.string().length(0)),
  caption: z.string().max(300, "Caption cannot exceed 300 characters").optional(),
});

type BuzzFormValues = z.infer<typeof buzzSchema>;

export default function SubmitBuzzPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (values: BuzzFormValues) => {
    if (!selectedFile) {
      setSubmitStatus({ type: "error", message: "Please select an image to upload." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData();
    formData.append("studentName", values.studentName);
    if (values.rollNumber) formData.append("rollNumber", values.rollNumber);
    if (values.instagramHandle) formData.append("instagramHandle", values.instagramHandle);
    if (values.email) formData.append("email", values.email);
    if (values.caption) formData.append("caption", values.caption);
    formData.append("image", selectedFile);

    try {
      const res = await submitBuzz(formData);
      if (res.success) {
        setSubmitStatus({ type: "success", message: res.message });
        reset();
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setSubmitStatus({ type: "error", message: res.message });
      }
    } catch (e) {
      setSubmitStatus({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] pt-28 pb-20 flex items-center justify-center relative">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cpcPurple/5 blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-8">
          <p className="text-[11px] font-bold tracking-[0.45em] uppercase text-cpcLight/80">
            Submit Your Frame
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Buzz Submissions
          </h1>
          <p className="text-xs sm:text-sm text-white/40 max-w-md mx-auto">
            Submit your awesome campus snapshots, aesthetic moments, or event frames. Selected entries will be featured in the club's buzz galleries!
          </p>
        </div>

        {submitStatus && (
          <div
            className={`mb-6 p-5 rounded-2xl border backdrop-blur-md flex items-start gap-3.5 transition-all animate-fade-in ${
              submitStatus.type === "success"
                ? "bg-green-500/10 border-green-500/25 text-green-300"
                : "bg-red-500/10 border-red-500/25 text-red-300"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">
                {submitStatus.type === "success" ? "Submission Received" : "Something went wrong"}
              </h4>
              <p className="text-xs opacity-80 leading-relaxed">{submitStatus.message}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-2xl hover:border-white/[0.08] transition-all duration-300"
        >
          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
              Upload Picture *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                previewUrl
                  ? "border-white/10 bg-white/[0.01]"
                  : "border-white/10 hover:border-cpcLight/50 hover:bg-white/[0.01]"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isSubmitting}
              />
              
              {previewUrl ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-60 mx-auto rounded-xl object-contain border border-white/10 shadow-lg"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-cpcLight">
                    <Camera size={14} />
                    <span>Change Selected Image</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto text-white/50 group-hover:text-white transition-colors">
                    <Upload size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white/80">Click or Drag to Upload</p>
                    <p className="text-xs text-white/40">PNG, JPG, WEBP or HEIC (Max 15MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Varun Teja Cherukuthota"
                {...register("studentName")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-cpcLight focus:border-cpcLight transition-all"
              />
              {errors.studentName && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.studentName.message}</p>
              )}
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
                Roll Number / Dept
              </label>
              <input
                type="text"
                placeholder="160120733045"
                {...register("rollNumber")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-cpcLight focus:border-cpcLight transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instagram Handle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
                Instagram Handle
              </label>
              <input
                type="text"
                placeholder="@username"
                {...register("instagramHandle")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-cpcLight focus:border-cpcLight transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                {...register("email")}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-cpcLight focus:border-cpcLight transition-all"
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#F8F5FB]/50 block">
              Caption / Story
            </label>
            <textarea
              placeholder="Tell us a story behind this frame..."
              {...register("caption")}
              disabled={isSubmitting}
              rows={3}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-cpcLight focus:border-cpcLight resize-none transition-all"
            />
            {errors.caption && (
              <p className="text-[11px] text-red-400 font-semibold">{errors.caption.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-cpcPurple hover:bg-cpcLight text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Submitting Frame...
              </>
            ) : (
              <>
                <Send size={14} />
                Send Submission
              </>
            )}
          </Button>

          {/* Coverage note */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/50">
              Need full official media coverage for an upcoming club or department event?{" "}
              <Link href="/coverage" className="text-[#C084FC] hover:text-white underline font-semibold transition-colors">
                Request Event Coverage →
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
