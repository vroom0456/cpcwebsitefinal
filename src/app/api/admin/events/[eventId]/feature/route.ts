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

    // 1. Fetch event to confirm existence
    const { data: event, error: fetchErr } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", eventId)
      .maybeSingle();

    if (fetchErr || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2. Record this event as the featured event in activity_logs (preserves organizing_club!)
    const { error: logErr } = await supabase.from("activity_logs").insert({
      action: "featured_home",
      event_id: eventId,
      metadata: { title: event.title, featured_at: new Date().toISOString() },
    });

    if (logErr) {
      console.warn("Failed to record featured_home in activity_logs:", logErr.message);
    }

    // 3. Revalidate home page and admin events
    revalidatePath("/");
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);

    return NextResponse.json({
      success: true,
      message: `"${event.title}" is now featured on the Home Page!`,
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

    // Clear featured event in activity_logs (preserves organizing_club!)
    await supabase.from("activity_logs").insert({
      action: "featured_home",
      event_id: null,
      metadata: { cleared_event_id: eventId, cleared_at: new Date().toISOString() },
    });

    // If this specific event had legacy organizing_club="featured_home", clear only that
    await supabase
      .from("events")
      .update({ organizing_club: null })
      .eq("id", eventId)
      .eq("organizing_club", "featured_home");

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
