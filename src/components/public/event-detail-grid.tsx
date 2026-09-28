import {
  CalendarDays,
  Clock,
  Building2,
  MapPin,
  Users2,
  RefreshCw,
  ImageIcon,
  Eye,
  HardDrive,
  Sparkles,
} from "lucide-react";
import type { Event } from "@/types/database";
import { formatBytes } from "@/lib/utils";

interface DetailItem {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}

function formatDate(value: string | null, options: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", options);
}

/**
 * Event details metadata grid featuring Event Name, Date, Venue, and Timings.
 */
export function EventDetailGrid({ event }: { event: Event }) {
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const items: DetailItem[] = [
    { label: "Event Name", value: event.title, icon: Sparkles },
    { label: "Date", value: formattedDate, icon: CalendarDays },
    { label: "Venue", value: event.venue ?? "CBIT Main Campus", icon: MapPin },
    { label: "Timings", value: event.timings ?? "10:00 AM - 5:00 PM", icon: Clock },
    { label: "Academic Year", value: event.academic_year ?? "2025-26", icon: CalendarDays },
    { label: "Category / Dept", value: `${event.category || "General"} · ${event.department || "CBIT"}`, icon: Building2 },
    { label: "Total Photos", value: `${event.photo_count.toLocaleString("en-US")} Photos`, icon: ImageIcon },
    { label: "Views", value: event.view_count.toLocaleString("en-US"), icon: Eye },
  ];

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1 rounded-2xl">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="p-4 sm:p-5 flex flex-col justify-between min-h-[96px] rounded-2xl bg-[#0B0515] border border-white/[0.08] relative overflow-hidden group hover:border-[#9D5EE5]/40 transition-all duration-300 shadow-lg"
        >
          {/* Subtle violet sheen on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(157,94,229,0.12) 0%, transparent 70%)",
            }}
          />

          <dt className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-widest text-[#9D5EE5]/90 relative z-10">
            <Icon className="h-3 w-3 shrink-0 text-[#C084FC]" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </dt>
          <dd className="mt-3 truncate text-xs sm:text-sm font-semibold text-white/90 relative z-10 font-sans" title={value}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
