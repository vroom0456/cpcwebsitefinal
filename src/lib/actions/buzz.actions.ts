"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmissionResponse {
  success: boolean;
  message: string;
}

export interface BuzzSubmission {
  id: string;
  student_name: string;
  roll_number: string | null;
  instagram_handle: string | null;
  email: string | null;
  image_url: string;
  caption: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * Submits a new Buzz entry.
 * Image is preserved at 100% full original quality on Google Drive.
 * Supabase does NOT store the heavy image file, avoiding storage quotas and quality degradation.
 */
export async function submitBuzz(formData: FormData): Promise<SubmissionResponse> {
  try {
    const studentName = (formData.get("studentName") as string)?.trim();
    const rollNumber = (formData.get("rollNumber") as string)?.trim();
    const instagramHandle = (formData.get("instagramHandle") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const caption = (formData.get("caption") as string)?.trim();
    const driveLink = ((formData.get("driveLink") || formData.get("imageUrl") || "") as string)?.trim();

    if (!studentName) {
      return { success: false, message: "Your name is required." };
    }

    if (!driveLink) {
      return { success: false, message: "Please provide a Google Drive link or image link to your photo." };
    }

    // Basic URL check
    if (!driveLink.startsWith("http://") && !driveLink.startsWith("https://")) {
      return { success: false, message: "Please enter a valid link starting with https://" };
    }

    const admin = createAdminClient();

    // Insert record into buzz_submissions table (only metadata + drive URL, no local storage waste)
    const { error: insertError } = await admin
      .from("buzz_submissions")
      .insert({
        student_name: studentName,
        roll_number: rollNumber || null,
        instagram_handle: instagramHandle ? (instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`) : null,
        email: email || null,
        caption: caption || null,
        image_url: driveLink,
        status: "pending",
      });

    if (insertError) {
      console.warn("buzz_submissions insert error:", insertError.message);
      return {
        success: false,
        message: "Failed to record submission. Please check your database connection or try again.",
      };
    }

    revalidatePath("/admin/buzz");

    return {
      success: true,
      message: "Your frame has been submitted successfully with full original quality! The Core Committee will review it for the gallery.",
    };
  } catch (error) {
    console.error("Buzz submission error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while submitting your photo. Please try again.",
    };
  }
}

/**
 * Fetch all buzz submissions for admin review.
 */
export async function getBuzzSubmissions(): Promise<BuzzSubmission[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("buzz_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching buzz_submissions:", error.message);
      return [];
    }

    return (data || []) as BuzzSubmission[];
  } catch (err) {
    console.error("Failed to load buzz submissions:", err);
    return [];
  }
}

/**
 * Update the review status of a buzz submission (pending / approved / rejected).
 */
export async function updateBuzzStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("buzz_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/buzz");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

/**
 * Delete a buzz submission.
 */
export async function deleteBuzzSubmission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("buzz_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/buzz");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete submission" };
  }
}
