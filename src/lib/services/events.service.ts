import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Event, PublicEventTeamMember } from "@/types/database";

export const DEFAULT_EVENTS: Event[] = [
  {
    id: "11111111-1111-1111-1111-111111111104",
    title: "Annual Photography Exhibition 2026",
    slug: "annual-exhibition-2026",
    category: "Exhibition",
    department: "CBIT Photo Club",
    venue: "R&D Seminar Block & Gallery Lounge",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2026-03-05",
    event_month: 3,
    status: "published",
    drive_folder_id: "1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
    description: "Showcasing the top 50 selected physical prints captured by student photographers across all departments.",
    photo_count: 6,
    subfolders: ["Exhibition Prints", "Inauguration & VIPs", "Award Ceremony"],
    view_count: 620,
    download_count: 110,
    storage_bytes: 52000000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2026-03-05T09:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111101",
    title: "Chaitanya Smriti Fest 2026",
    slug: "chaitanya-smriti-2026",
    category: "Cultural Fest",
    department: "Student Affairs",
    venue: "Main Campus Grounds & Open Air Theatre",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2026-02-20",
    event_month: 2,
    status: "published",
    drive_folder_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    description: "The official annual cultural extravaganza of CBIT captured in vivid detail by the CBIT Photo Club team.",
    photo_count: 7,
    subfolders: ["Stage & Live Concerts", "Crowd & Stalls", "Behind The Scenes", "Celebrity Guests"],
    view_count: 840,
    download_count: 142,
    storage_bytes: 48900000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2026-02-20T10:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    title: "Studio Lighting & Portrait Workshop",
    slug: "studio-lighting-workshop",
    category: "Workshop",
    department: "Technical Training",
    venue: "Audio Visual Room & Studio Lab",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2025-11-22",
    event_month: 11,
    status: "published",
    drive_folder_id: "18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
    cover_photo_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
    description: "Hands-on masterclass covering 3-point lighting setups, diffuser grids, camera metering, and portrait posing technique.",
    photo_count: 6,
    subfolders: ["Studio Lighting Setups", "Model Portraits", "Practical Demos"],
    view_count: 498,
    download_count: 64,
    storage_bytes: 31000000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2025-11-22T10:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    title: "Freshers Orientation 2025-26",
    slug: "freshers-orientation-2025-26",
    category: "Orientation",
    department: "CBIT Campus",
    venue: "Assembly Hall & OAT",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2025-09-15",
    event_month: 9,
    status: "published",
    drive_folder_id: "1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
    description: "Welcoming the incoming batch of engineering students with interactive photo booths, club showcase, and campus tours.",
    photo_count: 6,
    subfolders: ["Core Committee Showcase", "Campus Tours", "Student Photo Booths"],
    view_count: 512,
    download_count: 78,
    storage_bytes: 38900000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2025-09-15T09:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    title: "Monsoon Photowalk 2025",
    slug: "monsoon-photowalk-2025",
    category: "Photowalk",
    department: "CPC Outings",
    venue: "Osman Sagar & Gandipet Lake",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2025-08-10",
    event_month: 8,
    status: "published",
    drive_folder_id: "1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    description: "Outdoor nature and monsoon landscape photography session exploring lighting, reflections, and shutter speed controls.",
    photo_count: 6,
    subfolders: ["Landscape Reflections", "Macro & Nature", "Club Member Candids"],
    view_count: 389,
    download_count: 47,
    storage_bytes: 28900000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2025-08-10T06:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    title: "Sudhee & Shruthi Fest 2025",
    slug: "sudhee-shruthi-2025",
    category: "Cultural & Tech Fest",
    department: "College Wide",
    venue: "CBIT Main Arena",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2024-25",
    event_date: "2025-03-22",
    event_month: 3,
    status: "published",
    drive_folder_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    description: "Flagship technical and cultural fest of CBIT featuring hackathons, rock band battles, and fine arts exhibits.",
    photo_count: 6,
    subfolders: ["Live Concerts", "Technical Competitions", "Dance & Drama"],
    view_count: 730,
    download_count: 95,
    storage_bytes: 42000000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2025-03-22T10:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    title: "Street & Heritage Walk — Charminar",
    slug: "heritage-walk-charminar-2025",
    category: "Heritage Photowalk",
    department: "CPC Outings",
    venue: "Old City & Charminar Precinct",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2024-25",
    event_date: "2025-01-26",
    event_month: 1,
    status: "published",
    drive_folder_id: "1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
    description: "Republic Day dawn photowalk capturing historic Hyderabad architecture, morning chai moments, and vibrant alleyways.",
    photo_count: 6,
    subfolders: ["Charminar Architecture", "Morning Street Life", "Golden Hour Candids"],
    view_count: 420,
    download_count: 53,
    storage_bytes: 35000000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: "2025-01-26T06:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111100",
    title: "Club Portfolio",
    slug: "portfolio",
    category: "Portfolio",
    department: "CBIT Photo Club",
    venue: "Campus Wide",
    organizing_club: "Chaitanya Photo Club",
    academic_year: "2025-26",
    event_date: "2026-01-01",
    event_month: 1,
    status: "published",
    drive_folder_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    cover_photo_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
    description: "Official curated portfolio and visual masterpieces of the CBIT Photography Club.",
    photo_count: 6,
    subfolders: ["Featured Work", "Portraits & People", "Street & Architecture", "Landscapes & Nature"],
    view_count: 1200,
    download_count: 215,
    storage_bytes: 65000000,
    drive_last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
      .order("event_date", { ascending: false });

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
