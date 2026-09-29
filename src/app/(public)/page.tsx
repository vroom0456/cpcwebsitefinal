import { HomeHero } from "@/components/public/home-hero";
import { HomeFeaturedFest } from "@/components/public/home-featured-fest";
import { HomeCTA } from "@/components/public/home-cta";
import { HomeAbout } from "@/components/public/home-about";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const [
    { count: eventsCount },
    { count: photosCount },
    { count: eventsThisYear },
    { data: dyuthiEvent },
    { data: recentEvent },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("photos").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", startOfYear),
    supabase
      .from("events")
      .select("id, title, cover_photo_url, photo_count, subfolders, event_date, venue")
      .eq("id", "1b0748de-9873-4190-a8e2-118c74d5796f")
      .maybeSingle(),
    supabase
      .from("events")
      .select("id, title, cover_photo_url, photo_count, subfolders, event_date, created_at, venue")
      .neq("id", "1b0748de-9873-4190-a8e2-118c74d5796f")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-transparent text-[#F8F5FB]">
      <HomeHero />
      <HomeFeaturedFest dyuthiEvent={dyuthiEvent} recentEvent={recentEvent} />
      <HomeAbout
        eventsCount={eventsCount || 0}
        photosCount={photosCount || 0}
        eventsThisYear={eventsThisYear || 0}
      />
      <HomeCTA />
    </div>
  );
}
