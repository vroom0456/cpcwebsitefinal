import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GalleryClient } from "@/components/public/gallery-client";

export const dynamic = "force-dynamic";

export default async function FacePhotosPage({ params }: { params: Promise<{ faceId: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const { data: face } = await supabase
    .from("faces")
    .select("*")
    .eq("id", resolvedParams.faceId)
    .eq("is_hidden", false)
    .single();

  if (!face) {
    notFound();
  }

    // Fetch photos linked to this face
  const { data: photoFaces } = await supabase
    .from("photo_faces")
    .select(`
      photo_id,
      photos (
        id, event_id, drive_file_id, filename, thumbnail_url, full_url,
        width, height, size_bytes, camera_make, camera_model, lens,
        taken_at, view_count, download_count, created_at,
        events (id, title, slug)
      )
    `)
    .eq("face_id", resolvedParams.faceId)
    .order("created_at", { ascending: false });

  // Transform the response to extract photos
  const photos = photoFaces?.map((pf: any) => pf.photos).filter(Boolean) || [];

  // Mock an event structure just to satisfy GalleryClient prop requirements
  const mockEvent = {
    id: "face-collection",
    title: `Photos of ${face.name}`,
    slug: `face-${face.id}`,
    description: null,
    category: null,
    department: null,
    venue: null,
    organizing_club: null,
    academic_year: null,
    event_date: null,
    timings: null,
    event_month: null,
    cover_photo_url: face.cover_face_url,
    status: "published",
    drive_folder_id: null,
    drive_last_synced_at: null,
    storage_bytes: 0,
    photo_count: photos.length,
    view_count: 0,
    download_count: 0,
    created_at: face.created_at,
    updated_at: face.updated_at
  } as any;

  return (
    <div className="relative w-full min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
      <div className="mb-12">
        <p className="text-[10px] font-bold tracking-[0.3em] text-[#9D5EE5] uppercase mb-2">
          Face Collection
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">{face.name}</h1>
        <p className="text-[#F8F5FB]/60">
          Showing {photos.length} photos containing this person.
        </p>
      </div>

      <GalleryClient photos={photos} event={mockEvent} />
    </div>
  );
}
