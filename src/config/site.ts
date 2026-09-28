export const siteConfig = {
  name: "CPC Photography Club",
  shortName: "CPC",
  description:
    "Browse and download event photography from Chaitanya Bharathi Institute of Technology's Photography Club.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  publicNav: [
    { label: "Events", href: "/events" },
    { label: "Timeline", href: "/timeline" },
    { label: "Archive", href: "/archive" },
  ],
  adminNav: [
    { label: "Overview", href: "/admin" },
    { label: "Events & Gallery", href: "/admin/events" },
    { label: "Team", href: "/admin/team" },
    { label: "Drive Sync", href: "/admin/drive" },
    { label: "Settings & Logs", href: "/admin/settings" },
  ],
} as const;
