"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Camera,
  Film,
  Sparkles,
  Archive,
  ArrowRight,
  User,
  Instagram,
  Mail,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface MemberInfo {
  name: string;
  role: string;
  instagram?: string;
  email?: string;
}

export interface GenTreeData {
  id: string;
  genLabel: string;
  yearRange: string;
  statusLabel: string;
  members: MemberInfo[];
}

const active12thGenMembers: MemberInfo[] = [
  { name: "Niteesh", role: "President", instagram: "https://instagram.com/_nitarora" },
  { name: "Sai Sankeerth Reddy", role: "Vice President", instagram: "https://instagram.com/sai_sankeerth_reddy" },
  { name: "Varun Teja Cherukuthota", role: "General Secretary", instagram: "https://instagram.com/vrooms_diaries" },
  { name: "Hamsini", role: "General Secretary", instagram: "https://instagram.com/_hamsiniii" },
  { name: "Kevin Tejas", role: "Joint Secretary", instagram: "https://instagram.com/kev.inseye" },
  { name: "Mahitha Vedantam", role: "Joint Secretary", instagram: "https://instagram.com/hitha_chithraalu" },
  { name: "Ram Shri Varun", role: "Documentation Head", instagram: "https://instagram.com/cbitphotoclub" },
  { name: "Rashmith Sheela", role: "Events Head", instagram: "https://instagram.com/rashmithsheela" },
  { name: "Surya Teja Jangili", role: "Media Head", instagram: "https://instagram.com/ocutales" },
];

const previousGenerations: GenTreeData[] = [
  {
    id: "11th",
    genLabel: "11th Gen",
    yearRange: "2025–26",
    statusLabel: "Alumni Board",
    members: [
      { name: "Adarsh", role: "President", instagram: "https://instagram.com/pxl_vision9" },
      { name: "Sowmya", role: "Vice President", instagram: "https://instagram.com/soo_full" },
      { name: "Nanda Kishore", role: "General Secretary", instagram: "https://instagram.com/nk__archives" },
      { name: "Medha Bonu", role: "General Secretary", instagram: "https://instagram.com/medhawscapes" },
      { name: "Aumer Ali", role: "Joint Secretary", instagram: "https://instagram.com/aumeecam" },
      { name: "Indradeep Roy", role: "Joint Secretary", instagram: "https://instagram.com/indradeep2004" },
      { name: "Ram Shri Varun", role: "Documentation Head", instagram: "https://instagram.com/cbitphotoclub" },
      { name: "Pavan Sriram", role: "Events Head", instagram: "https://instagram.com/pavan_sriram" },
      { name: "Hamsini", role: "Media Head", instagram: "https://instagram.com/_hamsiniii" },
      { name: "Surya Teja", role: "Media Head", instagram: "https://instagram.com/ocutales" },
    ],
  },
  {
    id: "10th",
    genLabel: "10th Gen",
    yearRange: "2024–25",
    statusLabel: "Alumni Board",
    members: [
      { name: "Sreekar", role: "President" },
      { name: "Varun", role: "Vice President" },
      { name: "Sujith", role: "General Secretary" },
      { name: "Sowmya", role: "Joint Secretary" },
      { name: "Niteesh", role: "Joint Secretary" },
      { name: "Adarsh", role: "Documentation Head" },
      { name: "Aumer Ali", role: "Events Head" },
      { name: "Nanda Kishore", role: "Media Head" },
    ],
  },
  {
    id: "9th",
    genLabel: "9th Gen",
    yearRange: "2023–24",
    statusLabel: "Alumni Board",
    members: [
      { name: "Kaushik", role: "President" },
      { name: "Charitha", role: "Vice President" },
      { name: "Varun", role: "General Secretary" },
      { name: "Sreekar", role: "Joint Secretary" },
      { name: "Praneeth", role: "Documentation Head" },
      { name: "Sujith", role: "Events Head" },
      { name: "Sowmya", role: "Media Head" },
    ],
  },
];

const pillars = [
  {
    icon: Camera,
    title: "Photography",
    desc: "Event documentation, editorial portraits, sports, and fine-art campus captures produced with prime glass and high dynamic range.",
  },
  {
    icon: Film,
    title: "Videography",
    desc: "Cinematic teasers, full-scale event aftermovies, and promotional films capturing the energy and atmosphere of CBIT.",
  },
  {
    icon: Sparkles,
    title: "Post-Production",
    desc: "Calibrated color grading, fine retouching, and fast-turnaround curation tailored for digital publishing and print.",
  },
  {
    icon: Archive,
    title: "Digital Archiving",
    desc: "A permanent, searchable cloud archive safeguarding 30,000+ high-resolution photographs spanning over a decade.",
  },
  {
    icon: Layers,
    title: "Visual Storytelling",
    desc: "Translating fleeting campus moments into lasting cultural memory for students, faculty, and alumni worldwide.",
  },
];

const milestones = [
  {
    year: "2014",
    tag: "Foundation",
    title: "CPC Begins",
    desc: "Founded by a close-knit group of passionate student photographers dedicated to giving CBIT its own visual voice.",
  },
  {
    year: "2018",
    tag: "Expansion",
    title: "Multi-Crew Production",
    desc: "Expanded across academic departments, covering state-level symposiums, cultural nights, and establishing official campus media partnerships.",
  },
  {
    year: "2022",
    tag: "Modernization",
    title: "Cloud & Metadata Vault",
    desc: "Transitioned to unified cloud storage pipelines, structured metadata tagging, and standardized editorial workflows.",
  },
  {
    year: "2026",
    tag: "Current Era",
    title: "30,000+ Frames Archived",
    desc: "126+ live event folders in 2026 alone, advanced face discovery, same-origin asset streaming, and a dedicated 12th Gen editorial board.",
  },
];

export function AboutPageClient() {
  const [activePrevGen, setActivePrevGen] = useState<string>("11th");

  return (
    <div className="min-h-screen bg-[#050208] text-[#F8F5FB] pt-24 sm:pt-32 pb-24 selection:bg-purple-500/30 selection:text-white">
      {/* ─── Hero Section ─── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-20 sm:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="space-y-4"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="w-6 h-px bg-[#C084FC]" />
            <span className="text-[11px] font-mono font-bold tracking-[0.35em] text-[#C084FC] uppercase">
              01 — THE VISION
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.05]">
            Visual storytelling <br />
            <span className="text-gradient-purple">at CBIT, Hyderabad.</span>
          </h1>

          <p className="max-w-2xl text-[15px] sm:text-[17px] text-[#F8F5FB]/70 leading-relaxed pt-2">
            Founded in 2014, CBIT Photo Club is the premier creative and photographic publication of Chaitanya Bharathi Institute of Technology. We preserve every festival, achievement, and silent campus moment through the lens.
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-8 font-mono text-[11px] text-white/50 border-t border-white/[0.06] mt-8">
            <div>
              <span className="text-white font-bold text-sm sm:text-base">EST. 2014</span>
              <p className="text-[9px] uppercase tracking-wider text-[#C084FC]">Founding Year</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-white font-bold text-sm sm:text-base">56,000+</span>
              <p className="text-[9px] uppercase tracking-wider text-[#C084FC]">Photos Archived</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-white font-bold text-sm sm:text-base">131+</span>
              <p className="text-[9px] uppercase tracking-wider text-[#C084FC]">Live Event Folders</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-white font-bold text-sm sm:text-base">HYDERABAD</span>
              <p className="text-[9px] uppercase tracking-wider text-[#C084FC]">Campus Base</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Timeline / Milestones ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-24 sm:mb-32">
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C084FC] font-bold">
              Heritage Timeline
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
            A decade of campus visual history
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
              className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-purple-500/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white group-hover:text-[#C084FC] transition-colors">
                    {m.year}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider text-[#C084FC] bg-purple-500/10 border border-purple-500/20">
                    {m.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
                <p className="text-[12.5px] text-[#F8F5FB]/60 leading-relaxed">{m.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Milestone 0{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── What We Do: The 5 Pillars ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-24 sm:mb-32">
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C084FC] font-bold">
              Capabilities
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
            What we do
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-purple-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#C084FC] mb-4 group-hover:scale-105 group-hover:bg-purple-500/20 transition-all">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#C084FC] transition-colors">
                  {p.title}
                </h3>
                <p className="text-[12.5px] text-[#F8F5FB]/60 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── 12th Gen Core Committee (Equal Peer Layout) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-24 sm:mb-32">
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={14} className="text-[#C084FC]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C084FC] font-bold">
                Active Leadership
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
              12th Gen Core Committee
            </h2>
            <p className="text-[13px] text-white/50 mt-1">2026–27 Executive Board</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-[#C084FC] text-[11px] font-mono font-medium self-start sm:self-auto">
            {active12thGenMembers.length} Leaders
          </span>
        </div>

        {/* Equal Grid of Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {active12thGenMembers.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </section>

      {/* ─── Previous Generations (Alumni Heritage) ─── */}
      <section id="heritage" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Archive size={14} className="text-[#C084FC]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C084FC] font-bold">
              Alumni Legacy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Previous Generations
          </h2>
          <p className="text-[13px] text-white/50 mt-1">
            Honoring the past leaders and visionaries who built and shaped the club.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] w-fit mb-8">
          {previousGenerations.map((gen) => (
            <button
              key={gen.id}
              onClick={() => setActivePrevGen(gen.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activePrevGen === gen.id
                  ? "bg-[#9D5EE5] text-white shadow-md"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {gen.genLabel} ({gen.yearRange})
            </button>
          ))}
        </div>

        {/* Selected Generation Content */}
        <AnimatePresence mode="wait">
          {previousGenerations
            .filter((g) => g.id === activePrevGen)
            .map((gen) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                    {gen.statusLabel} • {gen.yearRange}
                  </span>
                  <span className="text-xs font-mono text-[#C084FC]">
                    {gen.members.length} Members
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {gen.members.map((member, idx) => (
                    <MemberCard key={`${member.name}-${idx}`} member={member} />
                  ))}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </section>

      {/* ─── Bottom Call to Action ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Have an event worth remembering?
          </h3>
          <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto">
            Book professional photography and videography coverage from our student team.
          </p>
          <div className="pt-2 flex flex-row items-center justify-center gap-3">
            <Link
              href="/coverage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E8D1FF] transition-all"
            >
              <span>Request Coverage</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-all"
            >
              <span>Browse Archive</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberCard({ member }: { member: MemberInfo }) {
  const initial = member.name ? member.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-purple-500/30 transition-all flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#C084FC] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C084FC] font-semibold truncate">
            {member.role}
          </p>
          <h4 className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
            {member.name}
          </h4>
        </div>
      </div>

      {member.instagram && (
        <a
          href={member.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label={`${member.name}'s Instagram`}
          className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-[#E1306C] hover:bg-white/[0.08] transition-colors shrink-0"
        >
          <Instagram size={13} />
        </a>
      )}
    </div>
  );
}
