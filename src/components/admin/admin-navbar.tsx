"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Users,
  Tag,
  RefreshCw,
  BarChart3,
  Settings,
  Search,
  Plus,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { GlobalSearchModal } from "@/components/public/global-search-modal";
import { logoutAdmin } from "@/lib/actions/auth.actions";

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const ADMIN_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Buzz", href: "/admin/buzz", icon: Sparkles },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Tags", href: "/admin/tags", icon: Tag },
  { label: "Drive Sync", href: "/admin/drive", icon: RefreshCw },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAdmin();
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#090412]/90 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group focus-visible:outline-none"
              aria-label="CBIT Photo Club Admin"
            >
              <div className="relative w-7 h-7 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="CBIT Photo Club Logo"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-white hidden sm:inline">
                  CPC Admin
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase text-[#C084FC] bg-purple-500/10 border border-purple-500/25">
                  Console
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Tabs */}
          <nav
            aria-label="Admin Sections"
            className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1"
          >
            {ADMIN_ITEMS.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer",
                    active
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <Icon
                    size={13}
                    className={active ? "text-black" : "text-white/40 group-hover:text-white"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Search (⌘K) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs font-medium text-white/70 hover:text-white cursor-pointer group"
              title="Search (Cmd+K)"
            >
              <Search size={13} className="text-[#C084FC] group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-[11px]">Search</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-white/50 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Create Event CTA */}
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Event</span>
            </Link>

            {/* View Public Site */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs text-white/60 hover:text-white cursor-pointer"
              title="View Public Site (opens new tab)"
            >
              <span className="text-[11px]">Public Site</span>
              <ExternalLink size={11} className="opacity-60" />
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 text-white/60 hover:text-red-400 transition-all text-xs cursor-pointer disabled:opacity-50"
              title="Logout"
            >
              <LogOut size={13} />
              <span className="hidden md:inline text-[11px]">
                {loggingOut ? "..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        isAdminOnly={true}
      />
    </>
  );
}

