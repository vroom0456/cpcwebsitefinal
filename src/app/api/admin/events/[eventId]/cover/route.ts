import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { eventId } = await params;
    const supabase = createAdminClient();

    let coverUrl: string | null = null;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const urlParam = formData.get("url") as string | null;

      if (urlParam) {
        coverUrl = urlParam;
      } else if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `cover-${eventId}-${Date.now()}.jpg`;

        // Ensure bucket exists
        try {
          await supabase.storage.createBucket("covers", { public: true });
        } catch {
          // Bucket may already exist
        }

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("covers")
          .upload(filename, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from("covers")
            .getPublicUrl(uploadData.path);
          coverUrl = publicUrlData?.publicUrl || null;
        }

        // If bucket upload returned error or storage not available, fall back to relative proxy or data url
        if (!coverUrl) {
          coverUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
        }
      }
    } else {
      const body = await request.json();
      coverUrl = body.coverUrl || body.photoUrl || null;
    }

    if (!coverUrl) {
      return NextResponse.json({ error: "Missing cover photo data" }, { status: 400 });
    }

    // Update event record in database
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = UUID_REGEX.test(eventId);

    const { error: dbError } = isUuid
      ? await supabase.from("events").update({ cover_photo_url: coverUrl }).eq("id", eventId)
      : await supabase.from("events").update({ cover_photo_url: coverUrl }).eq("slug", eventId);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Revalidate affected pages
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/gallery/${eventId}`);

    return NextResponse.json({
      success: true,
      coverUrl,
      message: "Cover photo updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update cover photo" }, { status: 500 });
  }
}
