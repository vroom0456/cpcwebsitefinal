function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && vercelUrl.length > 0) {
    return `https://${vercelUrl}`;
  }
  return "https://cbitphotoclub.vercel.app";
}

export const siteConfig = {
  name: "CPC Photography Club",
  shortName: "CPC",
  description:
    "Browse and download event photography from Chaitanya Bharathi Institute of Technology's Photography Club.",
  url: resolveSiteUrl(),
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
