import { createAdminClient } from "@/lib/supabase/server";

export async function ensureDatabaseSeeded() {
  try {
    const admin = createAdminClient();

    // Check if any events exist in Supabase
    const { data: existingEvents } = await admin
      .from("events")
      .select("id")
      .limit(1);

    if (existingEvents && existingEvents.length > 0) {
      return { seeded: false, message: "Database already contains events" };
    }

    // Seed Events
    const seedEvents = [
      {
        title: "Chaitanya Smriti Fest 2026",
        slug: "chaitanya-smriti-2026",
        category: "Cultural Fest",
        department: "Student Affairs",
        venue: "Main Campus Grounds",
        academic_year: "2025-26",
        event_date: "2026-02-20",
        status: "published",
        drive_folder_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
        cover_photo_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
        description: "The official annual cultural extravaganza of CBIT captured in vivid detail by the CBIT Photo Club team.",
        photo_count: 6,
        view_count: 340,
        storage_bytes: 48900000,
      },
      {
        title: "Freshers Orientation 2025-26",
        slug: "freshers-orientation-2025-26",
        category: "Orientation",
        department: "CBIT Campus",
        venue: "Assembly Hall & OAT",
        academic_year: "2025-26",
        event_date: "2025-09-15",
        status: "published",
        drive_folder_id: "1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
        cover_photo_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
        description: "Welcoming the incoming batch of engineering students with interactive photo booths, club showcase, and campus tours.",
        photo_count: 5,
        view_count: 512,
        storage_bytes: 38900000,
      },
      {
        title: "Monsoon Photowalk 2025",
        slug: "monsoon-photowalk-2025",
        category: "Photowalk",
        department: "CPC Outings",
        venue: "Osman Sagar & Gandipet",
        academic_year: "2025-26",
        event_date: "2025-08-10",
        status: "published",
        drive_folder_id: "1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
        cover_photo_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
        description: "Outdoor nature and monsoon landscape photography session exploring lighting, reflections, and shutter speed controls.",
        photo_count: 4,
        view_count: 289,
        storage_bytes: 28900000,
      },
      {
        title: "Annual Photography Exhibition 2026",
        slug: "annual-exhibition-2026",
        category: "Exhibition",
        department: "CBIT Photo Club",
        venue: "R&D Seminar Block",
        academic_year: "2025-26",
        event_date: "2026-03-05",
        status: "published",
        drive_folder_id: "1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
        cover_photo_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
        description: "Showcasing the top 50 selected physical prints captured by student photographers across all departments.",
        photo_count: 5,
        view_count: 620,
        storage_bytes: 52000000,
      },
      {
        title: "Studio Lighting & Portrait Workshop",
        slug: "studio-lighting-workshop",
        category: "Workshop",
        department: "Technical Training",
        venue: "Audio Visual Room",
        academic_year: "2025-26",
        event_date: "2025-11-22",
        status: "published",
        drive_folder_id: "18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
        cover_photo_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
        description: "Hands-on masterclass covering 3-point lighting setups, diffuser grids, camera metering, and portrait posing technique.",
        photo_count: 4,
        view_count: 198,
        storage_bytes: 21000000,
      },
    ];

    const { data: createdEvents, error: insertError } = await admin
      .from("events")
      .insert(seedEvents)
      .select("id, slug");

    if (insertError) {
      console.warn("Seed insertion error:", insertError.message);
      return { seeded: false, error: insertError.message };
    }

    // Map inserted event IDs
    const eventMap = new Map((createdEvents ?? []).map((e: any) => [e.slug, e.id]));

    // Seed Photos
    const seedPhotos = [
      {
        event_id: eventMap.get("chaitanya-smriti-2026") || (createdEvents && createdEvents[0]?.id),
        drive_file_id: "1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
        filename: "Stage Performance / Musical Evening.jpg",
        thumbnail_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs=w800",
        full_url: "https://lh3.googleusercontent.com/d/1GDxjq5WvO6ortPVDbRgsyNr__wH3YdVs",
        width: 4240,
        height: 2832,
        camera_make: "SONY",
        camera_model: "ILCE-6400",
        lens: "E 18-135mm F3.5-5.6 OSS",
        is_published: true,
        is_cover: true,
      },
      {
        event_id: eventMap.get("freshers-orientation-2025-26") || (createdEvents && createdEvents[1]?.id),
        drive_file_id: "1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
        filename: "Core Committee Group Portrait.jpg",
        thumbnail_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-=w800",
        full_url: "https://lh3.googleusercontent.com/d/1J2MzaO4aA8UvSd1W50SkaGm242R6JTC-",
        width: 6000,
        height: 4000,
        camera_make: "SONY",
        camera_model: "ILCE-7M3",
        lens: "FE 28-70mm F3.5-5.6 OSS",
        is_published: true,
        is_cover: true,
      },
      {
        event_id: eventMap.get("monsoon-photowalk-2025") || (createdEvents && createdEvents[2]?.id),
        drive_file_id: "1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
        filename: "Monsoon Rays & Lake View.jpg",
        thumbnail_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_=w800",
        full_url: "https://lh3.googleusercontent.com/d/1dZVTCSBNRLp7DUD5HqWaHF8YzmHFnSX_",
        width: 2400,
        height: 1600,
        camera_make: "Canon",
        camera_model: "EOS 200D II",
        lens: "EF-S18-55mm f/4-5.6 IS STM",
        is_published: true,
        is_cover: true,
      },
      {
        event_id: eventMap.get("annual-exhibition-2026") || (createdEvents && createdEvents[3]?.id),
        drive_file_id: "1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
        filename: "Selected Masterpiece / Portrait Framing.jpg",
        thumbnail_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs=w800",
        full_url: "https://lh3.googleusercontent.com/d/1LifGmo919TvSkZR5vcEKcyX84SPqVoXs",
        width: 3072,
        height: 3840,
        camera_make: "OnePlus",
        camera_model: "Nord 3 5G",
        lens: "5.59mm f/1.8",
        is_published: true,
        is_cover: true,
      },
      {
        event_id: eventMap.get("studio-lighting-workshop") || (createdEvents && createdEvents[4]?.id),
        drive_file_id: "18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
        filename: "Workshop Practical Session / Campfire.jpg",
        thumbnail_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p=w800",
        full_url: "https://lh3.googleusercontent.com/d/18qC69OdGBBZraU-jRAgQUzDeviEZT99p",
        width: 3500,
        height: 2333,
        camera_make: "SONY",
        camera_model: "ILCE-7M4",
        lens: "FE 24-70mm F2.8 GM II",
        is_published: true,
        is_cover: true,
      },
    ].filter((p) => Boolean(p.event_id));

    if (seedPhotos.length > 0) {
      await admin.from("photos").upsert(seedPhotos, { onConflict: "drive_file_id" });
    }

    return { seeded: true, count: seedEvents.length };
  } catch (err) {
    return { seeded: false, error: err instanceof Error ? err.message : "Seeding failed" };
  }
}
