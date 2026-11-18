import { HomeHero } from "@/components/public/home-hero";
import { HomeLatestCoverage } from "@/components/public/home-latest-coverage";
import { HomeCTA } from "@/components/public/home-cta";
import { HomeAbout } from "@/components/public/home-about";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EVENTS } from "@/lib/services/events.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let featuredEvent: any = null;
  let recentEvents: any[] | null = null;
  let eventsCount = DEFAULT_EVENTS.length;
  let photosCount = DEFAULT_EVENTS.reduce((sum, e) => sum + (e.photo_count || 0), 0);
  let eventsThisYear = DEFAULT_EVENTS.filter(
    (e) => (e.academic_year || "").includes("2026") || (e.event_date || "").startsWith("2026")
  ).length;

  try {
    const fetchWithTimeout = async () => {
      const supabase = await createClient();

      // 1. Fetch featured event
      const { data: featuredLog } = await supabase
        .from("activity_logs")
        .select("event_id")
        .eq("action", "featured_home")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (featuredLog?.event_id) {
        const { data } = await supabase
          .from("events")
          .select("id, title, cover_photo_url, photo_count, subfolders, event_date, venue, created_at")
          .eq("id", featuredLog.event_id)
          .maybeSingle();
        featuredEvent = data;
      }

      if (!featuredEvent) {
        const { data } = await supabase
          .from("events")
          .select("id, title, cover_photo_url, photo_count, subfolders, event_date, venue, created_at")
          .eq("organizing_club", "featured_home")
          .maybeSingle();
        featuredEvent = data;
      }

      // 2. Fetch recent events
      const featuredId = featuredEvent?.id;
      let recentQuery = supabase
        .from("events")
        .select("id, title, cover_photo_url, photo_count, event_date, created_at, venue, subfolders")
        .gt("photo_count", 0)
        .order("created_at", { ascending: false })
        .limit(5);

      if (featuredId) {
        recentQuery = recentQuery.neq("id", featuredId);
      }

      const { data: recent } = await recentQuery;
      if (recent && recent.length > 0) recentEvents = recent;

      // 3. Stats
      const [eRes, pRes, yRes] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("photos").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published").eq("academic_year", "2026-27"),
      ]);
      if (eRes.count) eventsCount = eRes.count;
      if (pRes.count) photosCount = pRes.count;
      if (yRes.count) eventsThisYear = yRes.count;
    };

    // Fast 1500ms race so user never waits 28s if remote DB is slow
    await Promise.race([
      fetchWithTimeout(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {}

  // Fallbacks from pre-cached events
  if (!featuredEvent) {
    featuredEvent = DEFAULT_EVENTS.find((e) => e.cover_photo_url && e.photo_count > 0) || DEFAULT_EVENTS[0];
  }
  const recList = (recentEvents as any) || [];
  const finalRecent = recList.length > 0 ? recList : DEFAULT_EVENTS.filter((e) => e.id !== featuredEvent?.id && e.photo_count > 0).slice(0, 4);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-transparent text-[#F8F5FB]">
      <HomeHero />
      <HomeLatestCoverage
        featuredEvent={featuredEvent}
        recentEvents={finalRecent.length > 0 ? finalRecent : DEFAULT_EVENTS.slice(1, 5)}
      />
      <HomeAbout
        eventsCount={eventsCount}
        photosCount={photosCount}
        eventsThisYear={eventsThisYear}
      />
      <HomeCTA />
    </div>
  );
}
