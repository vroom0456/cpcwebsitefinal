"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Instagram, Mail, ArrowUpRight, Camera, ExternalLink } from "lucide-react";

const publicFooterLinks = [
  { label: "Events", href: "/events" },
  { label: "Submit Buzz", href: "/submit-buzz" },
  { label: "Request Coverage", href: "/coverage" },
  { label: "About", href: "/#about" },
];

const adminFooterLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Events", href: "/admin/events" },
  { label: "Team", href: "/admin/team" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Drive Sync", href: "/admin/drive" },
  { label: "Tags", href: "/admin/tags" },
  { label: "Logs", href: "/admin/logs" },
  { label: "Settings", href: "/admin/settings" },
];

export function PublicFooter() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminFooterLinks : publicFooterLinks;

  return (
    <footer className="relative overflow-hidden" style={{
      background: "rgba(5,2,8,0.92)",
      backdropFilter: "blur(32px)",
      borderTop: "1px solid rgba(157,94,229,0.1)",
    }}>
      {/* Subtle glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[250px] opacity-[0.05]"
        style={{ background: "radial-gradient(ellipse, #4F168E 0%, transparent 70%)" }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(157,94,229,0.4) 30%, rgba(192,132,252,0.6) 50%, rgba(157,94,229,0.4) 70%, transparent)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href={isAdmin ? "/admin" : "/"} className="inline-flex items-center gap-2.5 sm:gap-3 mb-3 group focus-visible:outline-none">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-all duration-300 group-hover:opacity-80 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="CBIT Photo Club Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center text-left leading-[1.25] font-bold tracking-[0.35em] text-[11px] sm:text-[12px] text-white uppercase">
                <span>CBIT</span>
                <span>Photo</span>
                <span>Club</span>
              </div>
            </Link>
            <p className="text-[12.5px] leading-relaxed text-[#F8F5FB]/50 max-w-[260px] mb-3.5">
              {isAdmin
                ? "CPC Core Committee Admin Portal & Command Center."
                : "Visual storytelling at Chaitanya Bharathi Institute of Technology, Hyderabad."}
            </p>
            {!isAdmin && (
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/cbitphotoclub"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-[rgba(157,94,229,0.15)] hover:border-[rgba(157,94,229,0.4)] transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={14} />
                </a>
                <a
                  href="mailto:photography_wbc@cbit.ac.in"
                  className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-[rgba(157,94,229,0.15)] hover:border-[rgba(157,94,229,0.4)] transition-all duration-200"
                  aria-label="Email"
                >
                  <Mail size={14} />
                </a>
                <Link
                  href="/events"
                  className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-[rgba(157,94,229,0.15)] hover:border-[rgba(157,94,229,0.4)] transition-all duration-200"
                  aria-label="Gallery"
                >
                  <Camera size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#F8F5FB] mb-2.5 sm:mb-3">
              {isAdmin ? "Admin Navigation" : "Navigate"}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-[#F8F5FB]/45 hover:text-white transition-colors duration-200 hover:text-[#C084FC]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Portal Info */}
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#F8F5FB] mb-2.5 sm:mb-3">
              {isAdmin ? "Admin Controls" : "Connect"}
            </p>
            <ul className="space-y-2">
              {isAdmin ? (
                <>
                  <li>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2.5 text-[13.5px] text-[#C084FC]/70 hover:text-white transition-colors duration-200"
                    >
                      ← Switch to Public Main Site
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:photography_wbc@cbit.ac.in"
                      className="inline-flex items-center gap-2.5 text-[13.5px] text-[#F8F5FB]/45 hover:text-white transition-colors duration-200"
                    >
                      <Mail size={13.5} className="text-cpcLight/60" />
                      photography_wbc@cbit.ac.in
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="mailto:photography_wbc@cbit.ac.in"
                      className="inline-flex items-center gap-2.5 text-[13.5px] text-[#F8F5FB]/45 hover:text-white transition-colors duration-200"
                    >
                      <Mail size={13.5} className="text-cpcLight/60" />
                      photography_wbc@cbit.ac.in
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/cbitphotoclub"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 text-[13.5px] text-[#F8F5FB]/45 hover:text-white transition-colors duration-200 group"
                    >
                      <Instagram size={13.5} className="text-cpcLight/60" />
                      @cbitphotoclub
                      <ArrowUpRight size={10.5} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/coverage"
                      className="inline-flex items-center gap-2.5 text-[13.5px] text-[#F8F5FB]/45 hover:text-[#C084FC] transition-colors duration-200 group"
                    >
                      <Camera size={13.5} className="text-cpcLight/60" />
                      Request Event Coverage
                      <ExternalLink size={10.5} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#F8F5FB]/20">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#F8F5FB]/30">
              Designed & Developed by CBIT Photo Club
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
