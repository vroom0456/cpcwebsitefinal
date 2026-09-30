"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, User, Mail, Instagram, Sparkles, ChevronDown } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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
  isCurrent?: boolean;
  president: MemberInfo[];
  vicePresident: MemberInfo[];
  generalSecretary: MemberInfo[];
  jointSecretary?: MemberInfo[];
  departmentHeads: {
    department: string;
    members: MemberInfo[];
  }[];
}

// 12th Generation (Current Active Board 2026-27)
const gen12Tree: GenTreeData = {
  id: "12th",
  genLabel: "12th Gen",
  yearRange: "2026–27",
  statusLabel: "Current Executive Board",
  isCurrent: true,
  president: [
    { name: "Niteesh", role: "President", instagram: "https://instagram.com/_nitarora" },
  ],
  vicePresident: [
    { name: "Sai Sankeerth Reddy", role: "Vice President", instagram: "https://instagram.com/sai_sankeerth_reddy" },
  ],
  generalSecretary: [
    { name: "Varun Teja Cherukuthota", role: "General Secretary", instagram: "https://instagram.com/vrooms_diaries" },
    { name: "Hamsini", role: "General Secretary", instagram: "https://instagram.com/_hamsiniii" },
  ],
  jointSecretary: [
    { name: "Kevin Tejas", role: "Joint Secretary", instagram: "https://instagram.com/kev.inseye" },
    { name: "Mahitha Vedantam", role: "Joint Secretary", instagram: "https://instagram.com/hitha_chithraalu" },
  ],
  departmentHeads: [
    {
      department: "Documentation",
      members: [
        { name: "Ram Shri Varun", role: "Documentation Head", instagram: "https://instagram.com/cbitphotoclub" },
      ],
    },
    {
      department: "Events",
      members: [
        { name: "Rashmith Sheela", role: "Events Head", instagram: "https://instagram.com/rashmithsheela" },
      ],
    },
    {
      department: "Media",
      members: [
        { name: "Surya Teja Jangili", role: "Media Head", instagram: "https://instagram.com/ocutales" },
      ],
    },
  ],
};

const paragraphs = [
  "The CBIT Photo Club is the official photography body of Chaitanya Bharathi Institute of Technology. Since 2014, our student team has documented campus life, college fests, cultural programs, and academic milestones.",
  "Through dedicated event coverage, workshops, and photo exhibitions, we bring together students passionate about photography, videography, editing, and design.",
];

interface HomeAboutProps {
  eventsCount?: number;
  photosCount?: number;
  eventsThisYear?: number;
}

export function HomeAbout({ eventsCount, photosCount, eventsThisYear }: HomeAboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: eventsCount ? `${eventsCount}+` : "150+", label: "All-Time Events" },
    { value: photosCount ? `${Math.floor(photosCount / 1000)}K+` : "10K+", label: "Photos Archived" },
    { value: eventsThisYear ? `${eventsThisYear}+` : "12+", label: "Events This Year" },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-label="About CPC"
      className="relative overflow-hidden bg-transparent py-12 sm:py-28"
    >
      {/* Decorative section separator top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(157,94,229,0.25)] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-12 text-center space-y-12 sm:space-y-20">
        {/* About Copy */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col items-center max-w-4xl mx-auto"
        >
          <motion.p variants={fadeUp} className="mb-2 sm:mb-4 text-[10px] sm:text-[11px] font-bold tracking-[0.45em] uppercase text-[#9D5EE5]">
            01 — The Vision
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F8F5FB] mb-5 sm:mb-8 font-display"
          >
            About <span className="bg-gradient-to-r from-cpcLight to-[#C084FC] bg-clip-text text-transparent font-bold">CPC</span>
          </motion.h2>

          <div className="space-y-6 max-w-2xl text-center">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-sm sm:text-base leading-[1.8] text-[#F8F5FB]/60 font-light"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-10">
            <a
              href="https://www.instagram.com/cbitphotoclub"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#F8F5FB]/70 transition-colors duration-300 hover:text-[#F8F5FB]"
            >
              Follow @cbitphotoclub on Instagram
              <span className="flex items-center justify-center w-7 h-7 rounded-full border border-white/10 transition-all duration-300 group-hover:border-cpcLight group-hover:bg-cpcLight/10">
                <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Dynamic Stats Row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-3 gap-6 border-y border-white/[0.04] py-8 max-w-3xl mx-auto"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col gap-1 items-center">
              <span className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F8F5FB] font-display">{s.value}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#F8F5FB]/40 font-semibold">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Core Committee & Structure */}
        <div className="space-y-8 sm:space-y-12 border-t border-white/[0.04] pt-8 sm:pt-16">
          {/* Faculty Coordinator Node (Top of section) */}
          <div className="relative flex justify-center z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-8 rounded-2xl sm:rounded-3xl glass-card glass-hover max-w-xl mx-auto text-center sm:text-left border border-purple-500/20 shadow-[0_0_50px_-10px_rgba(157,94,229,0.2)]"
            >
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden glass-purple flex items-center justify-center shrink-0 border border-purple-500/30">
                <div className="absolute inset-1.5 sm:inset-2 pointer-events-none opacity-40">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C084FC]" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C084FC]" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C084FC]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C084FC]" />
                </div>
                <User size={30} className="text-[#C084FC] transition-transform group-hover:scale-110" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[9.5px] uppercase tracking-[0.25em] text-[#9D5EE5] font-bold">
                  Faculty Coordinator
                </p>
                <h3 className="font-bold text-lg sm:text-2xl text-white font-display mt-0.5 sm:mt-1">
                  Mr. K. Gurubrahmam
                </h3>
                <p className="text-[11px] sm:text-xs text-white/45 mt-0.5 font-sans">
                  Chaitanya Bharathi Institute of Technology (CBIT)
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="flex flex-col items-center text-center space-y-2 sm:space-y-4"
          >
            <motion.p variants={fadeUp} className="text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase text-[#9D5EE5]">
              Core Committee
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F8F5FB] font-display">
              Our Core Committee
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[11px] sm:text-xs text-[#F8F5FB]/50 max-w-lg">
              The dedicated student team steering CBIT Photo Club forward together.
            </motion.p>
          </motion.div>

          {/* Equal Team Grid Layout */}
          <div className="max-w-6xl mx-auto pt-4">
            {/* 12th Gen (Current Active Committee) */}
            <div className="space-y-4">
              <CCGenEqualLayout genData={gen12Tree} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getAllMembers(genData: GenTreeData): MemberInfo[] {
  const members: MemberInfo[] = [];
  members.push(...genData.president);
  members.push(...genData.vicePresident);
  members.push(...genData.generalSecretary);
  if (genData.jointSecretary) {
    members.push(...genData.jointSecretary);
  }
  for (const dept of genData.departmentHeads) {
    members.push(...dept.members);
  }
  return members;
}

// Equal Committee Layout: Clean Grid without Vertical Hierarchies
function CCGenEqualLayout({ genData }: { genData: GenTreeData }) {
  const allMembers = getAllMembers(genData);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/[0.06] pb-3 gap-2 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9D5EE5]">
            {genData.yearRange} • {genData.statusLabel}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
            {genData.genLabel} Core Committee
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-[#C084FC] border border-purple-500/20 uppercase tracking-wider">
          {allMembers.length} Members
        </span>
      </div>

      {/* Unified Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
        {allMembers.map((member, idx) => (
          <CCMemberNode key={`${member.name}-${idx}`} member={member} isCompact={true} />
        ))}
      </div>
    </div>
  );
}

// CCMemberNode Component for Tree nodes — Premium Glass Card Design
function CCMemberNode({ member, isCompact = false }: { member: MemberInfo; isCompact?: boolean }) {
  const isVacant = !member.name;
  const initial = member.name ? member.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`relative w-full group transition-all duration-300 text-left cursor-default ${
        isCompact
          ? "p-3 sm:p-3.5 rounded-xl"
          : "p-3.5 sm:p-4 rounded-xl max-w-sm mx-auto"
      } ${
        isVacant
          ? "border-dashed border border-white/[0.06] bg-white/[0.01]"
          : "border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/30 shadow-lg"
      } flex items-center justify-between`}
    >
      {/* Subtle inner glow on hover */}
      {!isVacant && (
        <div
          className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(157,94,229,0.06) 0%, transparent 70%)" }}
        />
      )}

      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
        {/* Avatar circle with initial */}
        <div
          className={`relative ${
            isCompact ? "w-10 h-10 rounded-xl text-[11px]" : "w-12 h-12 rounded-2xl text-[13px]"
          } flex items-center justify-center shrink-0 font-black ${
            isVacant
              ? "glass border-dashed text-white/15"
              : "glass-purple text-[#C084FC] group-hover:shadow-[0_0_16px_rgba(157,94,229,0.3)] transition-shadow duration-300"
          }`}
        >
          {isVacant ? <User size={isCompact ? 14 : 18} className="text-white/15" /> : initial}
        </div>

        <div>
          <p className={`${isCompact ? "text-[8px]" : "text-[9px]"} uppercase tracking-[0.25em] text-[#9D5EE5] font-bold`}>
            {member.role}
          </p>
          <h4
            className={`font-semibold font-display ${
              isCompact ? "text-xs mt-0.5" : "text-sm sm:text-base mt-1"
            } ${isVacant ? "text-white/20 italic" : "text-white"}`}
          >
            {isVacant ? "Position Vacant" : member.name}
          </h4>
        </div>
      </div>

      {/* Social Actions */}
      <div className="flex items-center gap-1.5 relative z-10">
        {member.instagram && (
          <a
            href={member.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${member.name}'s Instagram`}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/35 hover:text-[#E1306C] hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5 transition-all duration-200 cursor-pointer"
          >
            <Instagram size={13} />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            aria-label={`Email ${member.name}`}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/35 hover:text-cpcLight hover:border-cpcLight/30 hover:bg-cpcLight/5 transition-all duration-200 cursor-pointer"
          >
            <Mail size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
