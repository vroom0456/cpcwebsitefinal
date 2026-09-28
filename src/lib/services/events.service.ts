import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Event, PublicEventTeamMember } from "@/types/database";
import fallbackEventsData from "@/lib/data/events-fallback.json";

export const DEFAULT_EVENTS: Event[] = (fallbackEventsData as unknown as Event[]);

function filterDefaultEvents(events: Event[], filters?: {
  department?: string;
  venue?: string;
  academicYear?: string;
  category?: string;
  organizingClub?: string;
  month?: number;
  search?: string;
}) {
  return events
    .filter((e) => e.slug !== "portfolio" && !e.title.toLowerCase().includes("portfolio"))
    .filter((e) => {
      if (filters?.department && e.department !== filters.department) return false;
      if (filters?.venue && e.venue !== filters.venue) return false;
      if (filters?.academicYear && e.academic_year !== filters.academicYear) return false;
      if (filters?.category && e.category !== filters.category) return false;
      if (filters?.organizingClub && e.organizing_club !== filters.organizingClub) return false;
      if (filters?.month && e.event_month !== filters.month) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));
}

export async function getPublishedEvents(filters?: {
  department?: string;
  venue?: string;
  academicYear?: string;
  category?: string;
  organizingClub?: string;
  month?: number;
  search?: string;
}): Promise<Event[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .not("slug", "eq", "portfolio")
      .not("title", "ilike", "portfolio")
      .order("event_date", { ascending: false })
      .limit(500);

    if (filters?.department) query = query.eq("department", filters.department);
    if (filters?.venue) query = query.eq("venue", filters.venue);
    if (filters?.academicYear) query = query.eq("academic_year", filters.academicYear);
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.organizingClub) query = query.eq("organizing_club", filters.organizingClub);
    if (filters?.month) query = query.eq("event_month", filters.month);
    if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return filterDefaultEvents(DEFAULT_EVENTS, filters);
    }
    return data;
  } catch (err) {
    return filterDefaultEvents(DEFAULT_EVENTS, filters);
  }
}

export async function getPortfolioEvent(): Promise<Event | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or("slug.eq.portfolio,title.ilike.portfolio")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_EVENTS.find((e) => e.slug === "portfolio") ?? DEFAULT_EVENTS[0] ?? null;
    }
    return data;
  } catch (err) {
    return DEFAULT_EVENTS.find((e) => e.slug === "portfolio") ?? DEFAULT_EVENTS[0] ?? null;
  }
}

export interface TimelineYearGroup {
  year: string;
  events: Event[];
  totalPhotos: number;
  totalStorageBytes: number;
}

export async function getTimelineEvents(): Promise<TimelineYearGroup[]> {
  try {
    const events = await getPublishedEvents();
    const groups = new Map<string, TimelineYearGroup>();

    for (const event of events) {
      const year =
        event.academic_year ||
        (event.event_date ? event.event_date.slice(0, 4) : "Unknown");

      if (!groups.has(year)) {
        groups.set(year, {
          year,
          events: [],
          totalPhotos: 0,
          totalStorageBytes: 0,
        });
      }

      const group = groups.get(year)!;
      group.events.push(event);
      group.totalPhotos += event.photo_count || 0;
      group.totalStorageBytes += Number(event.storage_bytes || 0);
    }

    return Array.from(groups.values()).sort((a, b) => b.year.localeCompare(a.year));
  } catch (err) {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return DEFAULT_EVENTS.find((e) => e.slug === slug || e.id === slug) ?? null;
    }
    return data;
  } catch (err) {
    return DEFAULT_EVENTS.find((e) => e.slug === slug || e.id === slug) ?? null;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (data) return data;

    const { data: slugData } = await supabase
      .from("events")
      .select("*")
      .eq("slug", id)
      .eq("status", "published")
      .maybeSingle();

    if (slugData) return slugData;

    return DEFAULT_EVENTS.find((e) => e.id === id || e.slug === id) ?? null;
  } catch (err) {
    return DEFAULT_EVENTS.find((e) => e.id === id || e.slug === id) ?? null;
  }
}

export async function getEventByIdAdmin(id: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (!error && data) return data;

    const { data: slugData } = await supabase.from("events").select("*").eq("slug", id).maybeSingle();
    if (slugData) return slugData;

    return DEFAULT_EVENTS.find((e) => e.id === id || e.slug === id) ?? null;
  } catch (err) {
    return DEFAULT_EVENTS.find((e) => e.id === id || e.slug === id) ?? null;
  }
}

export async function getEventsAdmin(): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_EVENTS;
    }
    return data;
  } catch (err) {
    return DEFAULT_EVENTS;
  }
}

export async function getEventFilterOptions() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("department, venue, academic_year, category, organizing_club")
      .eq("status", "published");

    const eventsList = (error || !data || data.length === 0) ? DEFAULT_EVENTS : data;

    const dedupe = (values: (string | null)[]) =>
      Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();

    return {
      departments: dedupe(eventsList.map((e: any) => e.department)),
      venues: dedupe(eventsList.map((e: any) => e.venue)),
      academicYears: dedupe(eventsList.map((e: any) => e.academic_year)).reverse(),
      categories: dedupe(eventsList.map((e: any) => e.category)),
      organizingClubs: dedupe(eventsList.map((e: any) => e.organizing_club)),
    };
  } catch (err) {
    const dedupe = (values: (string | null)[]) =>
      Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();

    return {
      departments: dedupe(DEFAULT_EVENTS.map((e) => e.department)),
      venues: dedupe(DEFAULT_EVENTS.map((e) => e.venue)),
      academicYears: dedupe(DEFAULT_EVENTS.map((e) => e.academic_year)).reverse(),
      categories: dedupe(DEFAULT_EVENTS.map((e) => e.category)),
      organizingClubs: dedupe(DEFAULT_EVENTS.map((e) => e.organizing_club)),
    };
  }
}

export async function getEventTeamPublic(eventId: string): Promise<PublicEventTeamMember[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "get_event_team_public" as never,
      { p_event_id: eventId } as never
    );
    if (error || !data) return [];
    return (data ?? []) as unknown as PublicEventTeamMember[];
  } catch (err) {
    return [];
  }
}

export async function incrementEventViews(eventId: string) {
  try {
    const supabase = createPublicClient();
    await supabase.rpc("increment_event_views" as never, { p_event_id: eventId } as never).select();
  } catch (err) {
    // Ignore RPC failure
  }
}
