"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  RefreshCw,
  Settings,
  Search,
  Plus,
  Sparkles,
} from "lucide-react";
import { GlobalSearchModal } from "@/components/public/global-search-modal";

const ADMIN_NAV_ICONS: Record<string, any> = {
  "/admin": LayoutDashboard,
  "/admin/events": Calendar,
  "/admin/team": Users,
  "/admin/drive": RefreshCw,
  "/admin/settings": Settings,
};

export function AdminHeaderNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="w-full mb-8">
      {/* ── Sleek Admin Command Bar ── */}
      <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-[#090412]/85 border border-purple-500/25 shadow-xl backdrop-blur-2xl">
        {/* Left: Nav Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {siteConfig.adminNav.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const IconComponent = ADMIN_NAV_ICONS[item.href] || LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl transition-all duration-200 whitespace-nowrap cursor-pointer",
                  active
                    ? "glass-purple text-white shadow-md shadow-purple-950/50 border border-purple-500/40"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <IconComponent
                  size={13}
                  className={active ? "text-[#C084FC]" : "text-white/40 group-hover:text-white"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Search & New Event Action Buttons (Single Row) */}
        <div className="flex items-center gap-1.5 shrink-0 px-0.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all text-[11px] sm:text-xs font-bold text-white/80 hover:text-white cursor-pointer group"
            title="Global Admin Search (Cmd+K)"
          >
            <Search size={13} className="text-[#C084FC] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-mono text-white/50 border border-white/10">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/admin/events/new"
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md btn-primary-glow cursor-pointer"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Event</span>
          </Link>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} isAdminOnly={true} />
    </div>
  );
}
