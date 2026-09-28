import { HomeHero } from "@/components/public/home-hero";
import { HomeServices } from "@/components/public/home-services";
import { HomeCTA } from "@/components/public/home-cta";
import { HomeAbout } from "@/components/public/home-about";
import { HomeStats } from "@/components/public/home-stats";
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
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("photos").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", startOfYear),
  ]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-transparent text-[#F8F5FB]">
      <HomeHero />
      <HomeAbout
        eventsCount={eventsCount || 0}
        photosCount={photosCount || 0}
        eventsThisYear={eventsThisYear || 0}
      />
      <HomeStats />
      <HomeServices />
      <HomeCTA />
    </div>
  );
}
