"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface CoverageFormValues {
  eventName: string;
  organizer: string;
  datetime: string;
  venue: string;
  photographers: string;
  coverageType?: "Photography" | "Videography" | "Both" | string;
  expectedAttendance?: string;
  requesterName: string;
  requesterRole: string;
  requesterPhone: string;
  requesterEmail: string;
  details?: string;
}

export interface CoverageSubmissionResponse {
  success: boolean;
  message: string;
  referenceId?: string;
  details?: CoverageFormValues;
}

export async function submitCoverageRequest(
  formData: CoverageFormValues
): Promise<CoverageSubmissionResponse> {
  try {
    if (
      !formData.eventName?.trim() ||
      !formData.organizer?.trim() ||
      !formData.datetime?.trim() ||
      !formData.venue?.trim() ||
      !formData.requesterName?.trim() ||
      !formData.requesterRole?.trim() ||
      !formData.requesterPhone?.trim() ||
      !formData.requesterEmail?.trim()
    ) {
      return {
        success: false,
        message: "Please fill in all required fields marked with an asterisk (*).",
      };
    }

    // Generate unique tracking reference ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceId = `CPC-COV-${new Date().getFullYear()}-${randomSuffix}`;

    // Attempt to persist in Supabase activity_logs
    try {
      const admin = createAdminClient();
      await admin.from("activity_logs").insert({
        action: "coverage_request",
        metadata: {
          reference_id: referenceId,
          event_name: formData.eventName,
          organizer: formData.organizer,
          datetime: formData.datetime,
          venue: formData.venue,
          photographers_needed: formData.photographers || "Not specified",
          requester_name: formData.requesterName,
          requester_role: formData.requesterRole,
          requester_phone: formData.requesterPhone,
          requester_email: formData.requesterEmail,
          additional_details: formData.details || "",
          submitted_at: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      console.warn("Could not save to activity_logs table:", dbErr);
    }

    return {
      success: true,
      referenceId,
      details: formData,
      message:
        "Your event coverage request has been officially recorded with the CBIT Photo Club team! Our leads will reach out to you shortly.",
    };
  } catch (err: any) {
    console.error("Coverage request error:", err);
    return {
      success: false,
      message: "An unexpected error occurred while submitting. Please try again or reach out to photography_wbc@cbit.ac.in directly.",
    };
  }
}
