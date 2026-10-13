"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface CoverageFormValues {
  eventName: string;
  organizer: string;
  datetime: string;
  venue: string;
  photographers: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  coverageType?: string;
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

    // Validate 10-hour advance notice requirement
    if (formData.eventDate && formData.startTime) {
      const eventStart = new Date(`${formData.eventDate}T${formData.startTime}`);
      const now = new Date();
      const diffHours = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (isNaN(diffHours) || diffHours < 10) {
        return {
          success: false,
          message:
            "Coverage requests must be booked at least 10 hours prior to the event start time. For urgent same-day coverage, please contact Photo Club leads directly.",
        };
      }
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
          photographers: formData.photographers,
          requester_name: formData.requesterName,
          requester_role: formData.requesterRole,
          requester_phone: formData.requesterPhone,
          requester_email: formData.requesterEmail,
          notes: formData.details || "",
          event_date: formData.eventDate,
          start_time: formData.startTime,
          end_time: formData.endTime,
          created_at: new Date().toISOString(),
        },
      });
    } catch (logErr) {
      console.warn("Could not log coverage request to activity_logs:", logErr);
    }

    return {
      success: true,
      message:
        "Your event coverage request has been registered with the CBIT Photo Club team! Our leads will review and get back to you.",
      referenceId,
      details: formData,
    };
  } catch (error) {
    console.error("Coverage request error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while submitting your request. Please try again.",
    };
  }
}
