import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      eventName,
      organizer,
      datetime,
      venue,
      photographers,
      requesterName,
      requesterRole,
      requesterPhone,
      requesterEmail,
      details,
    } = body || {};

    if (
      !eventName?.trim() ||
      !organizer?.trim() ||
      !datetime?.trim() ||
      !venue?.trim() ||
      !requesterName?.trim() ||
      !requesterRole?.trim() ||
      !requesterPhone?.trim() ||
      !requesterEmail?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in all required fields marked with an asterisk (*).",
        },
        { status: 400 }
      );
    }

    // Generate unique reference ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceId = `CPC-COV-${new Date().getFullYear()}-${randomSuffix}`;

    const submissionData = {
      eventName: eventName.trim(),
      organizer: organizer.trim(),
      datetime: datetime.trim(),
      venue: venue.trim(),
      photographers: photographers || "2",
      requesterName: requesterName.trim(),
      requesterRole: requesterRole.trim(),
      requesterPhone: requesterPhone.trim(),
      requesterEmail: requesterEmail.trim(),
      details: (details || "").trim(),
    };

    // Safely record to Supabase activity_logs if available
    try {
      const admin = createAdminClient();
      await admin.from("activity_logs").insert({
        action: "coverage_request",
        metadata: {
          reference_id: referenceId,
          ...submissionData,
          submitted_at: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      console.warn("Could not save to activity_logs table:", dbErr);
    }

    return NextResponse.json({
      success: true,
      referenceId,
      details: submissionData,
      message:
        "Your event coverage request has been recorded with the CBIT Photo Club team! Our leads will reach out to you shortly.",
    });
  } catch (err: any) {
    console.error("API /api/coverage error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while processing coverage request.",
      },
      { status: 500 }
    );
  }
}
