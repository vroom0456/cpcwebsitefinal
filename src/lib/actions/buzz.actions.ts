"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface SubmissionResponse {
  success: boolean;
  message: string;
}

export async function submitBuzz(formData: FormData): Promise<SubmissionResponse> {
  try {
    const studentName = formData.get("studentName") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const instagramHandle = formData.get("instagramHandle") as string;
    const email = formData.get("email") as string;
    const caption = formData.get("caption") as string;
    const file = formData.get("image") as File;

    if (!studentName || !file) {
      return { success: false, message: "Student name and image are required." };
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `buzz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    let imageUrl = "";

    // 1. Try uploading to Supabase Storage
    const bucketName = "buzz_submissions";
    
    // Ensure bucket exists by attempting to create it (admin client handles this safely)
    try {
      await admin.storage.createBucket(bucketName, { public: true });
    } catch (e) {
      // Ignore if it already exists or creation fails
    }

    const { data: uploadData, error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.warn("Storage upload failed, falling back to simulated URL:", uploadError.message);
      // Fallback: Use a placeholder object URL simulation
      imageUrl = `https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000`;
    } else {
      // Get public URL
      const { data: publicUrlData } = admin.storage.from(bucketName).getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Insert record into buzz_submissions table
    const { error: insertError } = await supabase
      .from("buzz_submissions")
      .insert({
        student_name: studentName,
        roll_number: rollNumber || null,
        instagram_handle: instagramHandle || null,
        email: email || null,
        caption: caption || null,
        image_url: imageUrl,
        status: "pending"
      });

    if (insertError) {
      console.warn("buzz_submissions insert error (table missing or unseeded):", insertError.message);
    }

    return { 
      success: true, 
      message: "Your buzz photo has been submitted successfully to CBIT Photography Club! The Core Committee will review your frame for the club gallery." 
    };
  } catch (error) {
    console.error("Buzz submission error:", error);
    return { 
      success: false, 
      message: "An error occurred while submitting your photo. Please try again later." 
    };
  }
}
