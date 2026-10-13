"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BuzzSubmission,
  updateBuzzStatus,
  deleteBuzzSubmission,
} from "@/lib/actions/buzz.actions";
import { coverPhotoSrc } from "@/lib/utils";
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Clock,
  Instagram,
  Mail,
  User,
  HardDrive,
  RefreshCw,
  Eye,
} from "lucide-react";

interface AdminBuzzClientProps {
  initialSubmissions: BuzzSubmission[];
  isAdmin: boolean;
}

export function AdminBuzzClient({
  initialSubmissions,
  isAdmin,
}: AdminBuzzClientProps) {
  const [submissions, setSubmissions] = useState<BuzzSubmission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  const filtered = submissions.filter((sub) => {
    if (activeTab !== "all" && sub.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = sub.student_name?.toLowerCase().includes(q);
      const matchRoll = sub.roll_number?.toLowerCase().includes(q);
      const matchInsta = sub.instagram_handle?.toLowerCase().includes(q);
      const matchEmail = sub.email?.toLowerCase().includes(q);
      const matchCaption = sub.caption?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchInsta && !matchEmail && !matchCaption) {
        return false;
      }
    }
    return true;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "approved" | "rejected"
  ) => {
    setLoadingId(id);
    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    const res = await updateBuzzStatus(id, newStatus);
    if (!res.success) {
      alert("Failed to update status: " + (res.error || "Unknown error"));
      // Rollback
      setSubmissions(initialSubmissions);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete the submission from "${studentName}"?`)) {
      return;
    }
    setLoadingId(id);
    const res = await deleteBuzzSubmission(id);
    if (res.success) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("Failed to delete submission: " + (res.error || "Unknown error"));
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="pb-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-white/60" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/50">
              Community Frames
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Buzz Submissions
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Review student-submitted campus photos. Original files remain untouched on Google Drive.
          </p>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
            <span className="text-white/40 mr-1.5">Pending:</span>
            <span className="font-semibold text-amber-400">{pendingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
            <span className="text-white/40 mr-1.5">Approved:</span>
            <span className="font-semibold text-emerald-400">{approvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
            <span className="text-white/40 mr-1.5">Total:</span>
            <span className="font-semibold text-white">{submissions.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/10 bg-white/[0.02] w-fit">
          {[
            { key: "all", label: "All", count: submissions.length },
            { key: "pending", label: "Pending", count: pendingCount },
            { key: "approved", label: "Approved", count: approvedCount },
            { key: "rejected", label: "Rejected", count: rejectedCount },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    active ? "bg-black/10 text-black font-bold" : "bg-white/10 text-white/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, roll, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.04] text-xs text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Submissions List / Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.01] space-y-3">
          <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-white/40">
            <Sparkles size={20} />
          </div>
          <h3 className="text-sm font-semibold text-white/90">No submissions found</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            {searchQuery
              ? `No results match "${searchQuery}". Try a different keyword.`
              : activeTab === "pending"
              ? "All caught up! There are currently no pending submissions awaiting review."
              : "No community submissions have been recorded in this category yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => {
            const isLoading = loadingId === sub.id;
            const imgSrc = coverPhotoSrc(sub.image_url, 800);
            const dateStr = sub.created_at
              ? new Date(sub.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            return (
              <div
                key={sub.id}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col justify-between transition-all hover:border-white/20"
              >
                {/* Photo Header & Status */}
                <div>
                  <div className="relative aspect-[4/3] w-full bg-black/60 overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={sub.caption || `Submission by ${sub.student_name}`}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Status badge top-left */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {sub.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-black shadow-md backdrop-blur-sm">
                          <CheckCircle2 size={11} /> Approved
                        </span>
                      )}
                      {sub.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black shadow-md backdrop-blur-sm">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                      {sub.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/90 text-white shadow-md backdrop-blur-sm">
                          <XCircle size={11} /> Rejected
                        </span>
                      )}
                    </div>

                    {/* Quick view button */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ src: imgSrc, name: sub.student_name })}
                      className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                      title="Inspect Photo"
                    >
                      <Eye size={13} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-white/90">
                          {sub.student_name}
                        </h4>
                        {sub.roll_number && (
                          <p className="text-[11px] text-white/50">{sub.roll_number}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0">{dateStr}</span>
                    </div>

                    {/* Meta contacts */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-white/60">
                      {sub.instagram_handle && (
                        <a
                          href={`https://instagram.com/${sub.instagram_handle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                        >
                          <Instagram size={11} className="text-pink-400" />
                          <span>{sub.instagram_handle}</span>
                        </a>
                      )}
                      {sub.email && (
                        <a
                          href={`mailto:${sub.email}`}
                          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                        >
                          <Mail size={11} className="text-blue-400" />
                          <span className="truncate max-w-[150px]">{sub.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Caption / Story */}
                    {sub.caption && (
                      <p className="text-xs text-white/70 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5 line-clamp-3">
                        &ldquo;{sub.caption}&rdquo;
                      </p>
                    )}

                    {/* Direct Link to Google Drive Original */}
                    <div className="pt-1">
                      <a
                        href={sub.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white font-medium hover:underline transition-colors"
                      >
                        <HardDrive size={12} className="text-emerald-400" />
                        <span>Open Original on Drive</span>
                        <ExternalLink size={10} className="text-white/40" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 border-t border-white/10 bg-white/[0.01] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {sub.status !== "approved" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(sub.id, "approved")}
                        className="h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Approve for gallery"
                      >
                        <CheckCircle2 size={12} />
                        <span>Approve</span>
                      </button>
                    )}

                    {sub.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(sub.id, "rejected")}
                        className="h-8 px-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Mark as rejected"
                      >
                        <XCircle size={12} />
                        <span>Reject</span>
                      </button>
                    )}

                    {sub.status !== "pending" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(sub.id, "pending")}
                        className="h-8 px-2 rounded-lg border border-white/10 bg-white/[0.02] text-white/60 hover:text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                        title="Reset to Pending"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDelete(sub.id, sub.student_name)}
                      className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-red-500/20 hover:border-red-500/30 text-white/40 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                      title="Delete entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={previewImage.src}
                alt={previewImage.name}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <p className="mt-2 text-xs text-white/60 text-center">
              {previewImage.name} · Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
