"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Camera,
  Calendar,
  MapPin,
  Users,
  Building2,
  CheckCircle2,
  Mail,
  ArrowRight,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  User,
  MessageSquare,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { submitCoverageRequest, type CoverageFormValues } from "@/lib/actions/coverage.actions";

const EASE = [0.16, 1, 0.3, 1] as const;

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export default function CoveragePage() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceId: string;
    details: CoverageFormValues;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<CoverageFormValues>({
    eventName: "",
    organizer: "",
    datetime: "",
    venue: "",
    photographers: "2",
    requesterName: "",
    requesterRole: "",
    requesterPhone: "",
    requesterEmail: "",
    details: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitCoverageRequest(formData);
      if (res.success && res.referenceId && res.details) {
        setSubmittedResult({
          referenceId: res.referenceId,
          details: res.details,
          message: res.message,
        });
      } else {
        setErrorMessage(res.message || "Failed to submit request. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const generateEmailText = () => {
    if (!submittedResult) return "";
    const d = submittedResult.details;
    return (
      `EVENT COVERAGE REQUEST [${submittedResult.referenceId}]\n` +
      `-----------------------------------------\n` +
      `Event Name: ${d.eventName}\n` +
      `Organized By: ${d.organizer}\n` +
      `Date & Time: ${d.datetime}\n` +
      `Venue: ${d.venue}\n` +
      `Photographers Requested: ${d.photographers}\n\n` +
      `Requester Contact:\n` +
      `Name: ${d.requesterName}\n` +
      `Role: ${d.requesterRole}\n` +
      `Phone: ${d.requesterPhone}\n` +
      `Email: ${d.requesterEmail}\n\n` +
      `Additional Notes: ${d.details || "None provided"}\n`
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateEmailText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (submittedResult) {
    const emailSubject = encodeURIComponent(
      `[${submittedResult.referenceId}] Event Coverage Request: ${submittedResult.details.eventName}`
    );
    const emailBody = encodeURIComponent(generateEmailText());
    const mailtoUrl = `mailto:photography_wbc@cbit.ac.in?subject=${emailSubject}&body=${emailBody}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=photography_wbc@cbit.ac.in&su=${emailSubject}&body=${emailBody}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(
      `*CBIT Photo Club Coverage Request [${submittedResult.referenceId}]*\nEvent: ${submittedResult.details.eventName}\nBy: ${submittedResult.details.organizer}\nDate: ${submittedResult.details.datetime}\nRequester: ${submittedResult.details.requesterName} (${submittedResult.details.requesterPhone})`
    )}`;

    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center pt-28 sm:pt-36 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "160px 160px" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4F168E, transparent 70%)", filter: "blur(120px)" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative z-10 w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6"
        >
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center ring-1 ring-emerald-400/30">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#C084FC] bg-purple-950/80 border border-purple-500/40 mb-3">
              REF #{submittedResult.referenceId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mb-2">
              Coverage Request Received!
            </h1>
            <p className="text-[#F8F5FB]/65 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              {submittedResult.message}
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-[13px] space-y-2.5 font-sans">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Event:</span>
              <span className="font-semibold text-white text-right">{submittedResult.details.eventName}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Organized By:</span>
              <span className="text-white/80 text-right">{submittedResult.details.organizer}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Date &amp; Time:</span>
              <span className="text-white/80 text-right">{submittedResult.details.datetime}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/40">Venue:</span>
              <span className="text-white/80 text-right">{submittedResult.details.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Contact:</span>
              <span className="text-[#C084FC] text-right font-medium">
                {submittedResult.details.requesterName} ({submittedResult.details.requesterPhone})
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied Details!" : "Copy Summary"}</span>
            </button>

            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 border border-purple-400 text-white transition-all shadow-lg shadow-purple-950/50"
            >
              <Mail size={14} />
              <span>Send via Gmail Web</span>
            </a>

            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
            >
              <ExternalLink size={14} />
              <span>Open Mail App</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 hover:text-white transition-all"
            >
              <MessageSquare size={14} />
              <span>Share on WhatsApp</span>
            </a>
          </div>

          {/* Footer controls */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setSubmittedResult(null);
                setFormData({
                  eventName: "",
                  organizer: "",
                  datetime: "",
                  venue: "",
                  photographers: "2",
                  requesterName: "",
                  requesterRole: "",
                  requesterPhone: "",
                  requesterEmail: "",
                  details: "",
                });
              }}
              className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              ← Submit Another Request
            </button>
            <span className="text-white/20">·</span>
            <Link href="/events" className="text-xs text-[#C084FC] hover:text-white transition-colors">
              Browse Event Archives →
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pt-28 sm:pt-36 pb-24 relative overflow-hidden">
      {/* Background Effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: "160px 160px" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #4F168E, transparent 70%)", filter: "blur(130px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 w-[700px] h-[700px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #9D5EE5, transparent 70%)", filter: "blur(150px)" }}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase bg-purple-950/60 border border-purple-500/30 text-[#C084FC] mb-4 shadow-sm">
            <Camera size={11} />
            <span>CPC Official Media Desk</span>
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-display font-bold leading-[1] tracking-[-0.03em] mb-4">
            Request <span className="text-gradient-purple">Event Coverage</span>
          </h1>
          <p className="text-[#F8F5FB]/65 text-xs sm:text-[15px] max-w-lg mx-auto leading-relaxed">
            Tell us about your upcoming CBIT campus event. Our student photojournalists and media team will be deployed
            to capture high-resolution moments and archive them in the club gallery.
          </p>
        </motion.div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          onSubmit={handleSubmit}
          className="bg-white/[0.02] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6"
        >
          {/* Event Details Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-2">
              <Camera size={13} />
              <span>Event Details</span>
            </h2>

            {/* Event Name */}
            <div className="space-y-1.5">
              <label htmlFor="eventName" className="text-xs font-semibold text-[#F8F5FB]/75">
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                id="eventName"
                type="text"
                required
                value={formData.eventName}
                onChange={(e) => setFormData((p) => ({ ...p, eventName: e.target.value }))}
                placeholder="e.g. Sudhee 2026, Shruthi Annual Fest, Workshop"
                className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organized By */}
              <div className="space-y-1.5">
                <label htmlFor="organizer" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Organized By <span className="text-red-400">*</span>
                </label>
                <select
                  id="organizer"
                  required
                  value={formData.organizer}
                  onChange={(e) => setFormData((p) => ({ ...p, organizer: e.target.value }))}
                  className="w-full bg-[#0E071A] border border-white/10 rounded-xl py-3 px-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C084FC] cursor-pointer"
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Club / Department</option>
                  <option value="CBIT Photo Club (CPC)" className="bg-[#0E071A] text-white">CBIT Photo Club (CPC)</option>
                  <option value="Chaitanya Samskruthi (Cultural Club)" className="bg-[#0E071A] text-white">Chaitanya Samskruthi (Cultural Club)</option>
                  <option value="Chaitanya Seva (NSS / Social Service)" className="bg-[#0E071A] text-white">Chaitanya Seva (NSS)</option>
                  <option value="Sudhee Tech Fest Committee" className="bg-[#0E071A] text-white">Sudhee Tech Fest Committee</option>
                  <option value="Shruthi Annual Fest Committee" className="bg-[#0E071A] text-white">Shruthi Annual Fest Committee</option>
                  <option value="CSE Department" className="bg-[#0E071A] text-white">CSE Department</option>
                  <option value="ECE Department" className="bg-[#0E071A] text-white">ECE Department</option>
                  <option value="EEE Department" className="bg-[#0E071A] text-white">EEE Department</option>
                  <option value="IT Department" className="bg-[#0E071A] text-white">IT Department</option>
                  <option value="AI&DS Department" className="bg-[#0E071A] text-white">AI&amp;DS Department</option>
                  <option value="Mechanical Department" className="bg-[#0E071A] text-white">Mechanical Department</option>
                  <option value="Civil Department" className="bg-[#0E071A] text-white">Civil Department</option>
                  <option value="Biotechnology Department" className="bg-[#0E071A] text-white">Biotechnology Department</option>
                  <option value="Other Club / Department" className="bg-[#0E071A] text-white">Other / Custom</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="space-y-1.5">
                <label htmlFor="datetime" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Date &amp; Time <span className="text-red-400">*</span>
                </label>
                <input
                  id="datetime"
                  type="text"
                  required
                  value={formData.datetime}
                  onChange={(e) => setFormData((p) => ({ ...p, datetime: e.target.value }))}
                  placeholder="e.g. October 15, 10:00 AM – 4:00 PM"
                  className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Venue */}
              <div className="space-y-1.5">
                <label htmlFor="venue" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Campus Venue <span className="text-red-400">*</span>
                </label>
                <select
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                  className="w-full bg-[#0E071A] border border-white/10 rounded-xl py-3 px-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C084FC] cursor-pointer"
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Campus Venue</option>
                  <option value="Main Assembly Hall (Block A)" className="bg-[#0E071A] text-white">Main Assembly Hall (Block A)</option>
                  <option value="Open Air Auditorium (OAT)" className="bg-[#0E071A] text-white">Open Air Auditorium (OAT)</option>
                  <option value="CBIT Sports Complex & Grounds" className="bg-[#0E071A] text-white">CBIT Sports Complex &amp; Grounds</option>
                  <option value="Block C Seminar Hall" className="bg-[#0E071A] text-white">Block C Seminar Hall</option>
                  <option value="Library Conference Room" className="bg-[#0E071A] text-white">Library Conference Room</option>
                  <option value="R&D Building Auditorium" className="bg-[#0E071A] text-white">R&amp;D Building Auditorium</option>
                  <option value="Placement Cell Seminar Hall" className="bg-[#0E071A] text-white">Placement Cell Seminar Hall</option>
                  <option value="CBIT Quadrangle" className="bg-[#0E071A] text-white">CBIT Quadrangle</option>
                  <option value="Off-Campus Outdoor Venue" className="bg-[#0E071A] text-white">Off-Campus / Outdoor Venue</option>
                </select>
              </div>

              {/* Photographers Needed */}
              <div className="space-y-1.5">
                <label htmlFor="photographers" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Photographers Needed
                </label>
                <select
                  id="photographers"
                  value={formData.photographers}
                  onChange={(e) => setFormData((p) => ({ ...p, photographers: e.target.value }))}
                  className="w-full bg-[#0E071A] border border-white/10 rounded-xl py-3 px-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C084FC] cursor-pointer"
                >
                  <option value="1" className="bg-[#0E071A] text-white">1 Photographer (Small Event)</option>
                  <option value="2" className="bg-[#0E071A] text-white">2 Photographers (Standard Team)</option>
                  <option value="3" className="bg-[#0E071A] text-white">3 Photographers (Major Fest Event)</option>
                  <option value="4" className="bg-[#0E071A] text-white">4 Photographers (Multi-track)</option>
                  <option value="5+" className="bg-[#0E071A] text-white">5+ Full Media Deployment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requester Contact Info */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-2">
              <User size={13} />
              <span>Requester Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="requesterName" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="requesterName"
                  type="text"
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterName: e.target.value }))}
                  placeholder="e.g. Varun Teja"
                  className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label htmlFor="requesterRole" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Role / Designation <span className="text-red-400">*</span>
                </label>
                <select
                  id="requesterRole"
                  required
                  value={formData.requesterRole}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterRole: e.target.value }))}
                  className="w-full bg-[#0E071A] border border-white/10 rounded-xl py-3 px-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C084FC] cursor-pointer"
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Your Role</option>
                  <option value="Club President / Convenor" className="bg-[#0E071A] text-white">Club President / Convenor</option>
                  <option value="Vice President / Secretary" className="bg-[#0E071A] text-white">Vice President / Secretary</option>
                  <option value="Event Coordinator" className="bg-[#0E071A] text-white">Event Coordinator</option>
                  <option value="Faculty Coordinator / HOD" className="bg-[#0E071A] text-white">Faculty Coordinator / HOD</option>
                  <option value="Student Lead" className="bg-[#0E071A] text-white">Student Lead</option>
                  <option value="Student Member" className="bg-[#0E071A] text-white">Student Member</option>
                  <option value="Other / External Organizer" className="bg-[#0E071A] text-white">Other / External</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="requesterPhone" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Phone Number (WhatsApp) <span className="text-red-400">*</span>
                </label>
                <input
                  id="requesterPhone"
                  type="tel"
                  required
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterPhone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="requesterEmail" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="requesterEmail"
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterEmail: e.target.value }))}
                  placeholder="name@cbit.ac.in"
                  className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label htmlFor="details" className="text-xs font-semibold text-[#F8F5FB]/75">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                id="details"
                rows={3}
                value={formData.details}
                onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                placeholder="VIP guests, schedule highlights, stage lighting details, or special moments to capture..."
                className="w-full bg-[#0E071A]/80 border border-white/10 rounded-xl p-3 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]/40 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-purple-950/60 border border-purple-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Submitting Request…</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Event Coverage Request</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-white/40 text-center mt-2.5">
              Submissions are recorded in the CPC database and automatically routed to the Core Committee.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
