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
  Info,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { submitCoverageRequest, type CoverageFormValues } from "@/lib/actions/coverage.actions";
import { getAllCBITClubsList, CBIT_CAMPUS_VENUES } from "@/lib/data/cbit-clubs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EASE = [0.16, 1, 0.3, 1] as const;

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function CoveragePageClient() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceId: string;
    details: CoverageFormValues;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Custom inputs for "Other" selections
  const [customOrganizer, setCustomOrganizer] = useState("");
  const [customVenue, setCustomVenue] = useState("");

  // Event timing details
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to compute hours between now and the event start
  const hoursUntilEvent = (() => {
    if (!eventDate || !startTime) return null;
    const eventStart = new Date(`${eventDate}T${startTime}`);
    const now = new Date();
    const diffMs = eventStart.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  })();

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

    // 1. Validate Date & Time presence
    if (!eventDate || !startTime) {
      setErrorMessage("Please select both the event date and start time.");
      setSubmitting(false);
      return;
    }

    // 2. Validate at least 10 hours prior notice
    if (hoursUntilEvent === null || hoursUntilEvent < 10) {
      setErrorMessage(
        "Event coverage requests must be booked at least 10 hours prior to the event start time. For urgent same-day coverage, please contact the Photo Club leads directly via WhatsApp or Phone."
      );
      setSubmitting(false);
      return;
    }

    // Resolve final organizer & venue (handling "Other / Custom")
    const finalOrganizer =
      formData.organizer === "Other Club / Department" && customOrganizer.trim()
        ? customOrganizer.trim()
        : formData.organizer;

    const finalVenue =
      formData.venue === "Other / Outdoor Venue" && customVenue.trim()
        ? customVenue.trim()
        : formData.venue;

    // Construct human-friendly formatted datetime
    const formattedDate = new Date(`${eventDate}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const formatTimeStr = (t: string) => {
      if (!t) return "";
      const [h, m] = t.split(":");
      const hour = parseInt(h || "0", 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    };
    const timingStr = endTime
      ? `${formatTimeStr(startTime)} – ${formatTimeStr(endTime)}`
      : formatTimeStr(startTime);
    const finalDateTime = `${formattedDate}, ${timingStr}`;

    const payload: CoverageFormValues = {
      ...formData,
      datetime: finalDateTime,
      organizer: finalOrganizer,
      venue: finalVenue,
      eventDate,
      startTime,
      endTime,
    };

    if (
      !payload.eventName.trim() ||
      !payload.organizer.trim() ||
      !payload.datetime.trim() ||
      !payload.venue.trim() ||
      !payload.requesterName.trim() ||
      !payload.requesterRole.trim() ||
      !payload.requesterPhone.trim() ||
      !payload.requesterEmail.trim()
    ) {
      setErrorMessage("Please complete all required fields marked with an asterisk (*).");
      setSubmitting(false);
      return;
    }

    try {
      // 1. First try REST API endpoint
      const apiResponse = await fetch("/api/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (apiResponse.ok) {
        const json = await apiResponse.json();
        if (json.success && json.referenceId) {
          setSubmittedResult({
            referenceId: json.referenceId,
            details: json.details || payload,
            message:
              json.message ||
              "Your event coverage request has been officially recorded with the CBIT Photo Club team! Our leads will reach out shortly.",
          });
          setSubmitting(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn("API route failed, falling back to Server Action:", apiErr);
    }

    // 2. Fallback to Server Action
    try {
      const res = await submitCoverageRequest(payload);
      if (res.success && res.referenceId && res.details) {
        setSubmittedResult({
          referenceId: res.referenceId,
          details: res.details,
          message: res.message,
        });
      } else {
        setErrorMessage(res.message || "Failed to submit request. Please try again or message photography_wbc@cbit.ac.in.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection or contact photography_wbc@cbit.ac.in directly.");
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
    try {
      await navigator.clipboard.writeText(generateEmailText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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
          className="relative z-10 w-full max-w-xl bg-[#0B0614]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6"
        >
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center ring-1 ring-emerald-400/30">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-white bg-white/10 border border-white/20 mb-3">
              REF #{submittedResult.referenceId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mb-2 uppercase">
              YOU&apos;RE ON THE FRAME.
            </h1>
            <p className="text-[#F8F5FB]/75 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              CPC will get back to you shortly.
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-[13px] space-y-2.5 font-sans">
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopy}
              className="h-11"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied Details!" : "Copy Summary"}</span>
            </Button>

            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-neutral-100 border border-white text-black transition-all shadow-md"
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
                setCustomOrganizer("");
                setCustomVenue("");
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
    <div className="min-h-screen bg-transparent text-white pt-24 sm:pt-36 pb-24 relative overflow-hidden">
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase text-[#C084FC] bg-purple-950/40 border border-purple-500/25 mb-3">
            <Camera size={11} />
            <span>CPC Media Desk</span>
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-display font-bold leading-[1.05] tracking-[-0.03em] mb-3 uppercase">
            REQUEST EVENT COVERAGE
          </h1>
          <p className="text-[#F8F5FB]/75 text-xs sm:text-[15px] max-w-lg mx-auto leading-relaxed">
            Have an event worth remembering?
          </p>

          {/* Quick Direct Assistance */}
          <div className="mt-4 flex flex-col items-center gap-2 text-xs">
            <p className="text-white/40 text-[11px]">Need urgent coordination?</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="mailto:photography_wbc@cbit.ac.in"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/20 text-white/90 hover:text-white hover:bg-white/15 transition-all text-[11px] font-medium"
              >
                <Mail size={11} />
                <span>photography_wbc@cbit.ac.in</span>
              </a>
              <a
                href="https://wa.me/919440590695?text=Hi%20CBIT%20Photo%20Club,%20we%20would%20like%20to%20request%20photography%20coverage%20for%20our%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/70 transition-all text-[11px] font-medium"
              >
                <MessageSquare size={11} />
                <span>WhatsApp Coordinator</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Coverage Guidelines (Clean & Unboxed) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8 space-y-4 text-left"
        >
          <div className="flex items-center gap-2 pb-1 border-b border-white/[0.08]">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C084FC]">
              Coverage Guidelines
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-[13px] text-white/80 leading-relaxed font-sans">
            <div>
              <strong className="text-white font-semibold">Prior Notice &amp; Scheduling:</strong>{" "}
              Requests for photography coverage should kindly be submitted at least 24 to 48 hours prior to the event whenever possible (minimum 10 hours advance notice required by the booking system). This enables the Photo Club to plan effectively and allocate student photographers accordingly. Official inquiries can also be directed to{" "}
              <a href="mailto:photography_wbc@cbit.ac.in" className="text-[#C084FC] underline underline-offset-2 hover:text-white">
                photography_wbc@cbit.ac.in
              </a>.
            </div>

            <div>
              <strong className="text-white font-semibold">Support and Respect for Student Photographers:</strong>{" "}
              We kindly request that students assigned for photography coverage be treated with due respect and provided with the necessary cooperation, guidance, and support throughout the event. Your encouragement will help them carry out their responsibilities effectively.
            </div>

            <div>
              <strong className="text-white font-semibold">Examination Period:</strong>{" "}
              During internal and semester examination periods, Photo Club students may have limited availability for event coverage due to their academic commitments. We request your kind understanding and cooperation in such instances.
            </div>
          </div>
        </motion.div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
          onSubmit={handleSubmit}
          className="space-y-8 sm:space-y-10"
        >
          {/* Event Details Section */}
          <div className="space-y-4 pt-1 border-t border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-2 pt-4">
              <Camera size={13} />
              <span>Event Details</span>
            </h2>

            {/* Event Name */}
            <div className="space-y-1.5">
              <label htmlFor="eventName" className="text-xs font-semibold text-[#F8F5FB]/75">
                Event Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="eventName"
                type="text"
                required
                value={formData.eventName}
                onChange={(e) => setFormData((p) => ({ ...p, eventName: e.target.value }))}
                placeholder="e.g. Sudhee 2026, Shruthi Annual Fest, Robotics Hackathon"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organized By */}
              <div className="space-y-1.5">
                <label htmlFor="organizer" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Organized By <span className="text-red-400">*</span>
                </label>
                <Select
                  id="organizer"
                  required
                  value={formData.organizer}
                  onChange={(e) => setFormData((p) => ({ ...p, organizer: e.target.value }))}
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Club / Department / Chapter</option>
                  {getAllCBITClubsList().map((group) => (
                    <optgroup key={group.group} label={group.group} className="bg-[#0E071A] text-[#C084FC] font-semibold">
                      {group.options.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0E071A] text-white font-normal">
                          {opt}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="Other" className="bg-[#0E071A] text-[#C084FC] font-semibold">
                    <option value="Other Club / Department" className="bg-[#0E071A] text-white">
                      Other Club / Department / External
                    </option>
                  </optgroup>
                </Select>

                {formData.organizer === "Other Club / Department" && (
                  <Input
                    type="text"
                    required
                    placeholder="Enter club or department name"
                    value={customOrganizer}
                    onChange={(e) => setCustomOrganizer(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Campus Venue */}
              <div className="space-y-1.5">
                <label htmlFor="venue" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Campus Venue <span className="text-red-400">*</span>
                </label>
                <Select
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Campus Venue</option>
                  {CBIT_CAMPUS_VENUES.map((v) => (
                    <option key={v} value={v} className="bg-[#0E071A] text-white">
                      {v}
                    </option>
                  ))}
                  <option value="Other / Outdoor Venue" className="bg-[#0E071A] text-white">Other Campus Location / Stage</option>
                </Select>

                {formData.venue === "Other / Outdoor Venue" && (
                  <Input
                    type="text"
                    required
                    placeholder="Enter specific campus location"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

              {/* Event Date & Timings with 10-Hour Advance Validation */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-semibold text-[#F8F5FB]/80 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#C084FC]" />
                    <span>Event Date &amp; Timings <span className="text-red-400">*</span></span>
                  </label>
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-amber-400/90 font-medium">
                    At least 10 hours prior notice required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Event Date */}
                  <div className="space-y-1">
                    <label htmlFor="eventDate" className="text-[10px] font-semibold uppercase text-white/50 block">Event Date *</label>
                    <Input
                      id="eventDate"
                      type="date"
                      required
                      min={todayStr}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  {/* Start Time */}
                  <div className="space-y-1">
                    <label htmlFor="startTime" className="text-[10px] font-semibold uppercase text-white/50 block">Start Time *</label>
                    <Input
                      id="startTime"
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-1">
                    <label htmlFor="endTime" className="text-[10px] font-semibold uppercase text-white/50 block">End Time</label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Real-time Notice Check */}
                {hoursUntilEvent !== null && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      hoursUntilEvent < 10
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    {hoursUntilEvent < 10 ? (
                      <>
                        <AlertTriangle size={15} className="shrink-0 text-red-400 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong>Cannot accept request:</strong> Selected event time is only{" "}
                          <strong>{Math.max(0, Math.round(hoursUntilEvent * 10) / 10)} hours away</strong>. Coverage requests must be submitted at least <strong>10 hours in advance</strong>. For urgent coordination, please contact club leads directly via WhatsApp or Phone below.
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                        <span>
                          Notice requirement verified (~{Math.round(hoursUntilEvent)} hours in advance).
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Photographers Needed */}
              <div className="space-y-1.5">
                <label htmlFor="photographers" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Photographers Needed
                </label>
                <Select
                  id="photographers"
                  value={formData.photographers}
                  onChange={(e) => setFormData((p) => ({ ...p, photographers: e.target.value }))}
                >
                  <option value="1" className="bg-[#0E071A] text-white">1 Photographer (Small Event)</option>
                  <option value="2" className="bg-[#0E071A] text-white">2 Photographers (Standard Team)</option>
                  <option value="3" className="bg-[#0E071A] text-white">3 Photographers (Major Fest Event)</option>
                  <option value="4" className="bg-[#0E071A] text-white">4 Photographers (Multi-track Event)</option>
                  <option value="5+" className="bg-[#0E071A] text-white">5+ Full Media Deployment</option>
                </Select>
              </div>

            </div>

          {/* Requester Contact Info */}
          <div className="pt-6 border-t border-white/[0.06] space-y-4">
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
                <Input
                  id="requesterName"
                  type="text"
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterName: e.target.value }))}
                  placeholder="e.g. Varun Teja"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label htmlFor="requesterRole" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Role / Designation <span className="text-red-400">*</span>
                </label>
                <Select
                  id="requesterRole"
                  required
                  value={formData.requesterRole}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterRole: e.target.value }))}
                >
                  <option value="" className="bg-[#0E071A] text-white">Select Your Role</option>
                  <option value="Club President / Convenor" className="bg-[#0E071A] text-white">Club President / Convenor</option>
                  <option value="Vice President / Secretary" className="bg-[#0E071A] text-white">Vice President / Secretary</option>
                  <option value="Event Coordinator" className="bg-[#0E071A] text-white">Event Coordinator</option>
                  <option value="Faculty Coordinator / HOD" className="bg-[#0E071A] text-white">Faculty Coordinator / HOD</option>
                  <option value="Student Lead" className="bg-[#0E071A] text-white">Student Lead</option>
                  <option value="Student Member" className="bg-[#0E071A] text-white">Student Member</option>
                  <option value="Other / External Organizer" className="bg-[#0E071A] text-white">Other / External</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="requesterPhone" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Phone Number (WhatsApp) <span className="text-red-400">*</span>
                </label>
                <Input
                  id="requesterPhone"
                  type="tel"
                  required
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterPhone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="requesterEmail" className="text-xs font-semibold text-[#F8F5FB]/75">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <Input
                  id="requesterEmail"
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, requesterEmail: e.target.value }))}
                  placeholder="name@cbit.ac.in"
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
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-white text-xs sm:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C084FC] focus:bg-white/[0.06] transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full h-12 text-xs sm:text-sm tracking-wider uppercase font-bold"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Submitting Request…</span>
                </>
              ) : (
                <>
                  <span>REQUEST COVERAGE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
            <p className="text-[11px] text-white/40 text-center mt-2.5">
              Submissions are recorded in the CPC database and automatically routed to the Core Committee.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
