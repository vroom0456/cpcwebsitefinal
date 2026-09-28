"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAdminPasscode(passcode: string) {
  const validPasscodes = ["admin", "cpc2026", "cbitphotoclub", "cpc-admin"];
  const cleanPass = (passcode || "").trim().toLowerCase();

  if (validPasscodes.includes(cleanPass)) {
    const cookieStore = await cookies();
    cookieStore.set("cpc_admin_auth", "authenticated", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }

  return { success: false, error: "Invalid Admin Passcode" };
}

export async function loginSupabaseUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Fallback: Check if user typed standard admin passcode in password field
      const passcodeRes = await loginAdminPasscode(password);
      if (passcodeRes.success) {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    const cookieStore = await cookies();
    cookieStore.set("cpc_admin_auth", "authenticated", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (err) {
    const passcodeRes = await loginAdminPasscode(password);
    if (passcodeRes.success) return { success: true };
    return { success: false, error: err instanceof Error ? err.message : "Authentication failed" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("cpc_admin_auth");
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  redirect("/admin-login");
}
