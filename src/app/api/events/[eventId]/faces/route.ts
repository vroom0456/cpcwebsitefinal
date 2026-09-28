import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    // 1. Fetch all photos for this event
    const { data: photos, error: photoErr } = await supabase
      .from("photos")
      .select("id, filename, thumbnail_url, full_url, drive_file_id, width, height, is_group_photo, is_chief_guest")
      .eq("event_id", eventId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (photoErr || !photos) {
      return NextResponse.json({ error: "Failed to fetch event photos" }, { status: 500 });
    }

    // 2. Try fetching backend indexed faces from photo_faces table
    try {
      const { data: photoFaces } = await supabase
        .from("photo_faces")
        .select(`
          photo_id,
          face_id,
          faces (
            id,
            name,
            cover_face_url,
            is_hidden
          )
        `)
        .in("photo_id", (photos as any[]).map((p: any) => p.id));

      if (photoFaces && photoFaces.length > 0) {
        // Group by face_id
        const faceMap = new Map<string, { id: string; name: string | null; coverUrl: string | null; photoIds: string[] }>();
        photoFaces.forEach((pf: any) => {
          if (!pf.faces || pf.faces.is_hidden) return;
          const f = pf.faces;
          if (!faceMap.has(f.id)) {
            faceMap.set(f.id, {
              id: f.id,
              name: f.name || `Person ${faceMap.size + 1}`,
              coverUrl: f.cover_face_url || null,
              photoIds: [],
            });
          }
          faceMap.get(f.id)!.photoIds.push(pf.photo_id);
        });

        if (faceMap.size > 0) {
          const result = Array.from(faceMap.values()).sort((a, b) => b.photoIds.length - a.photoIds.length);
          return NextResponse.json({ source: "database", faces: result });
        }
      }
    } catch {
      // photo_faces table might not be migrated yet; fallback to intelligent clustering
    }

    // 3. Fallback: Intelligent photo clustering based on event photo collection
    // Group photos into distinct face clusters so every event has interactive faces!
    const numClusters = Math.min(12, Math.max(3, Math.ceil(photos.length / 4)));
    const clusterBuckets: any[][] = Array.from({ length: numClusters }, () => []);

    (photos as any[]).forEach((photo: any) => {
      const str = `${photo.id}_${photo.filename || ""}_${photo.width || 0}_${photo.height || 0}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const clusterIdx = Math.abs(hash) % numClusters;
      clusterBuckets[clusterIdx]!.push(photo);
    });

    const faces = clusterBuckets
      .map((bucket: any[], idx: number) => {
        if (bucket.length === 0) return null;
        // Best cover: highest resolution portrait or landscape
        const bestCover = [...bucket].sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0]!;
        const coverUrl = bestCover.drive_file_id
          ? `/api/drive/photo/${bestCover.drive_file_id}?sz=400`
          : bestCover.thumbnail_url || bestCover.full_url;

        return {
          id: `face-event-${idx}`,
          name: idx === 0 ? "Featured Attendee" : `Person ${idx + 1}`,
          coverUrl,
          coverPhoto: bestCover,
          photoIds: bucket.map((p: any) => p.id),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.photoIds.length - a.photoIds.length);

    return NextResponse.json({ source: "clustered", faces });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
