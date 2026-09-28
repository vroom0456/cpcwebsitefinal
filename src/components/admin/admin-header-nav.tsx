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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-3xl bg-[#090412]/80 border border-purple-500/25 shadow-2xl backdrop-blur-2xl">
        {/* Left: Nav Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-1">
          {siteConfig.adminNav.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const IconComponent = ADMIN_NAV_ICONS[item.href] || LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all duration-200 whitespace-nowrap cursor-pointer",
                  active
                    ? "glass-purple text-white shadow-lg shadow-purple-950/50 border border-purple-500/40 scale-[1.02]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <IconComponent
                  size={14}
                  className={active ? "text-[#C084FC]" : "text-white/40 group-hover:text-white"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Search & New Event Action Buttons */}
        <div className="flex items-center gap-2 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 px-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all text-xs font-bold text-white/80 hover:text-white cursor-pointer group"
            title="Global Admin Search (Cmd+K)"
          >
            <Search size={13} className="text-[#C084FC] group-hover:scale-110 transition-transform" />
            <span>Search</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-mono text-white/50 border border-white/10">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/admin/events/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md btn-primary-glow cursor-pointer"
          >
            <Plus size={14} />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} isAdminOnly={true} />
    </div>
  );
}
