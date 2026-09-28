import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedEvents } from "@/lib/services/events.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let events: any[] = [];
  try {
    events = await Promise.race([
      getPublishedEvents(),
      new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 2500)),
    ]);
  } catch (err) {
    console.warn("Sitemap: failed to fetch dynamic event routes during build, falling back to static routes.");
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/timeline`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/archive`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${siteConfig.url}/gallery/${event.id}`,
    lastModified: event.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...eventRoutes];
}
