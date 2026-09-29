import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { eventId } = await params;
    const supabase = createAdminClient();

    // 1. Reset any existing featured_home flags across all events
    await supabase
      .from("events")
      .update({ organizing_club: null })
      .eq("organizing_club", "featured_home");

    // 2. Set the chosen event as the Home Page featured event
    const { data, error } = await supabase
      .from("events")
      .update({ organizing_club: "featured_home" })
      .eq("id", eventId)
      .select("id, title, organizing_club")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Revalidate home page and admin events
    revalidatePath("/");
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);

    return NextResponse.json({
      success: true,
      message: `"${data.title}" is now featured on the Home Page!`,
      isFeatured: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { eventId } = await params;
    const supabase = createAdminClient();

    await supabase
      .from("events")
      .update({ organizing_club: null })
      .eq("id", eventId);

    revalidatePath("/");
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);

    return NextResponse.json({
      success: true,
      message: "Event removed from Home Page featured slot.",
      isFeatured: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
