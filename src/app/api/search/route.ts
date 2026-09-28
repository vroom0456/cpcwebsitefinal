import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Calculate Levenshtein Edit Distance for typo tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    const row = new Array(n + 1).fill(0);
    row[0] = i;
    dp.push(row);
  }
  for (let j = 0; j <= n; j++) {
    dp[0]![j] = j;
  }

  for (let i = 1; i <= m; i++) {
    const prevRow = dp[i - 1]!;
    const currRow = dp[i]!;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        currRow[j] = prevRow[j - 1]!;
      } else {
        currRow[j] = 1 + Math.min(prevRow[j]!, currRow[j - 1]!, prevRow[j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
}

// Helper to strip all hyphens, spaces, and punctuation for hyphen-insensitive matching
function normalizePunctuation(str: string): string {
  return str.toLowerCase().replace(/[\s\-_.:,/'"()]+/g, "");
}

// Compute fuzzy match score for text against query (higher score = better match)
function calculateFuzzyScore(text: string | null | undefined, query: string): number {
  if (!text || !query) return 0;
  const tNorm = text.toLowerCase();
  const qNorm = query.toLowerCase().trim();

  // 1. Exact match
  if (tNorm === qNorm) return 100;

  // 2. Hyphen/Punctuation-insensitive match (e.g. "2025 26" or "202526" matches "2025-26", "campus wide" matches "campus-wide")
  const tClean = normalizePunctuation(text);
  const qClean = normalizePunctuation(query);
  if (tClean && qClean && (tClean.includes(qClean) || qClean.includes(tClean))) {
    return 90;
  }

  // 3. Substring match
  if (tNorm.includes(qNorm)) return 80;

  // 4. Word token matching
  const tWords = tNorm.split(/[\s_.,-/]+/);
  const qWords = qNorm.split(/[\s_.,-/]+/);
  let totalScore = 0;

  for (const qWord of qWords) {
    if (qWord.length < 2) continue;
    let maxWordScore = 0;

    for (const tWord of tWords) {
      if (tWord.length < 2) continue;

      // Exact word match
      if (tWord === qWord) {
        maxWordScore = Math.max(maxWordScore, 70);
        continue;
      }

      // Hyphenless token match
      if (normalizePunctuation(tWord) === normalizePunctuation(qWord)) {
        maxWordScore = Math.max(maxWordScore, 65);
        continue;
      }

      // Word prefix match (e.g., "graduat" matches "graduation")
      if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
        maxWordScore = Math.max(maxWordScore, 50);
        continue;
      }

      // Levenshtein typo distance check
      const maxDistance = qWord.length <= 4 ? 1 : 2;
      if (Math.abs(tWord.length - qWord.length) <= maxDistance) {
        const dist = levenshtein(tWord, qWord);
        if (dist === 1) maxWordScore = Math.max(maxWordScore, 40);
        else if (dist === 2) maxWordScore = Math.max(maxWordScore, 25);
      }
    }

    totalScore += maxWordScore;
  }

  return totalScore;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ events: [], photos: [], members: [] });
  }

  try {
    const supabase = await createClient();
    const cleanQ = normalizePunctuation(q);
    const qPrefix = cleanQ.length >= 2 ? cleanQ.slice(0, Math.min(3, cleanQ.length)) : q.slice(0, 3);

    const [eventsRes, photosRes, membersRes] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, slug, category, venue, department, academic_year, cover_photo_url, event_date")
        .or(`title.ilike.%${qPrefix}%,category.ilike.%${qPrefix}%,venue.ilike.%${qPrefix}%,department.ilike.%${qPrefix}%,slug.ilike.%${qPrefix}%`)
        .limit(60),
      supabase
        .from("photos")
        .select("id, filename, camera_model, drive_file_id, thumbnail_url, event_id")
        .or(`filename.ilike.%${qPrefix}%,camera_model.ilike.%${qPrefix}%`)
        .eq("is_published", true)
        .limit(60),
      supabase
        .from("members")
        .select("id, name, position, department, year, profile_photo_url")
        .or(`name.ilike.%${qPrefix}%,position.ilike.%${qPrefix}%,department.ilike.%${qPrefix}%`)
        .limit(60),
    ]);

    const { DEFAULT_EVENTS } = await import("@/lib/services/events.service");
    const { DEFAULT_PHOTOS } = await import("@/lib/services/photos.service");
    const { getMembers } = await import("@/lib/services/members.service");

    const eventsSource = (eventsRes.data && eventsRes.data.length > 0) ? eventsRes.data : DEFAULT_EVENTS;
    const photosSource = (photosRes.data && photosRes.data.length > 0) ? photosRes.data : DEFAULT_PHOTOS;
    const membersSource = (membersRes.data && membersRes.data.length > 0) ? membersRes.data : await getMembers();

    // Rank & filter events with fuzzy scoring
    const scoredEvents = (eventsSource || [])
      .map((ev: any) => {
        const titleScore = calculateFuzzyScore(ev.title, q) * 1.5;
        const catScore = calculateFuzzyScore(ev.category, q);
        const venueScore = calculateFuzzyScore(ev.venue, q);
        const deptScore = calculateFuzzyScore(ev.department, q);
        const slugScore = calculateFuzzyScore(ev.slug, q);

        const score = Math.max(titleScore, catScore, venueScore, deptScore, slugScore);
        return { item: ev, score };
      })
      .filter((entry: { item: any; score: number }) => entry.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 6)
      .map((entry: { item: any }) => entry.item);

    // Rank & filter photos
    const scoredPhotos = (photosSource || [])
      .map((ph: any) => {
        const fileScore = calculateFuzzyScore(ph.filename, q);
        const cameraScore = calculateFuzzyScore(ph.camera_model, q);
        const score = Math.max(fileScore, cameraScore);
        return { item: ph, score };
      })
      .filter((entry: { item: any; score: number }) => entry.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 6)
      .map((entry: { item: any }) => entry.item);

    // Rank & filter members
    const scoredMembers = (membersSource || [])
      .map((mb: any) => {
        const nameScore = calculateFuzzyScore(mb.name, q) * 1.5;
        const posScore = calculateFuzzyScore(mb.position, q);
        const deptScore = calculateFuzzyScore(mb.department, q);
        const score = Math.max(nameScore, posScore, deptScore);
        return { item: mb, score };
      })
      .filter((entry: { item: any; score: number }) => entry.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 6)
      .map((entry: { item: any }) => entry.item);

    return NextResponse.json({
      events: scoredEvents,
      photos: scoredPhotos,
      members: scoredMembers,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ events: [], photos: [], members: [] });
  }
}
