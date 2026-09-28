"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Sparkles } from "lucide-react";

export function AdminSidebar({ memberName, isAdmin }: { memberName: string; isAdmin: boolean }) {
  const pathname = usePathname();

  const filteredNav = siteConfig.adminNav.filter((item) => {
    if (!isAdmin) {
      return ["Overview", "Events", "Gallery", "Analytics"].includes(item.label);
    }
    return true;
  });

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between min-h-screen relative z-20"
      style={{
        background: "rgba(5,2,8,0.75)",
        backdropFilter: "blur(32px)",
        borderRight: "1px solid rgba(157,94,229,0.12)",
        padding: "1.5rem",
      }}>
      <div className="space-y-6">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 pb-5"
          style={{ borderBottom: "1px solid rgba(157,94,229,0.1)" }}>
          <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(79,22,142,0.2)",
              border: "1px solid rgba(157,94,229,0.3)",
              boxShadow: "0 0 20px rgba(157,94,229,0.1)",
            }}>
            <Image
              src="/images/logo.png"
              alt="CBIT Photography Club Logo"
              width={36}
              height={36}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white block">
              CBIT Photo Club
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-1"
              style={{ color: "rgba(192,132,252,0.7)" }}>
              <Sparkles size={8} /> Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[9px] font-bold uppercase tracking-[0.25em] mb-3"
            style={{ color: "rgba(157,94,229,0.5)" }}>
            Navigation Hub
          </p>
          <nav className="flex flex-col gap-1" aria-label="Admin">
            {filteredNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                    active
                      ? "font-semibold text-white"
                      : "hover:text-white"
                  )}
                  style={active ? {
                    background: "rgba(79,22,142,0.2)",
                    border: "1px solid rgba(157,94,229,0.3)",
                    boxShadow: "0 0 16px rgba(79,22,142,0.15)",
                    color: "rgba(248,245,251,1)",
                  } : {
                    color: "rgba(248,245,251,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(157,94,229,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(248,245,251,0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(248,245,251,0.4)";
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User badge at bottom */}
      <div className="pt-5 space-y-2" style={{ borderTop: "1px solid rgba(157,94,229,0.1)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{
            background: "rgba(79,22,142,0.1)",
            border: "1px solid rgba(157,94,229,0.18)",
          }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(157,94,229,0.15)",
              border: "1px solid rgba(157,94,229,0.3)",
            }}>
            <ShieldCheck size={13} style={{ color: "rgba(192,132,252,0.85)" }} />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-bold text-white truncate">{memberName}</p>
            <p className="text-[9px] font-medium" style={{ color: "rgba(157,94,229,0.7)" }}>Core Committee Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
