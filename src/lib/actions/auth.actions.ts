"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateCCMember,
  createSignedSessionToken,
  CC_SESSION_COOKIE,
  getCurrentCCSession,
} from "@/lib/auth/cc-auth";

/**
 * Log in a Core Committee member using their identifier (username or email)
 * and individual password.
 */
export async function loginCCMemberAction(identifier: string, passcode: string) {
  const result = await authenticateCCMember(identifier, passcode);
  if (!result.success || !result.member) {
    return { success: false, error: result.error || "Authentication failed" };
  }

  const token = createSignedSessionToken(result.member);
  const cookieStore = await cookies();

  // Set cryptographically signed session cookie
  cookieStore.set(CC_SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Also set legacy auth cookie for backwards compatibility
  cookieStore.set("cpc_admin_auth", "authenticated", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    member: {
      name: result.member.name,
      role: result.member.role,
      username: result.member.username,
    },
  };
}

export type LoginUniversalResult = {
  success: boolean;
  error?: string;
  member?: {
    name: string;
    role: string;
    username: string;
  };
};

/**
 * Universal admin login supporting both individual CC credentials and Supabase auth.
 */
export async function loginUniversalAdmin(identifier: string, password: string): Promise<LoginUniversalResult> {
  // 1. Check Core Committee credentials first
  const ccRes = await loginCCMemberAction(identifier, password);
  if (ccRes.success) {
    return ccRes;
  }

  // 2. If identifier looks like email, try Supabase Auth
  if (identifier && identifier.includes("@")) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (!error) {
        const cookieStore = await cookies();
        cookieStore.set("cpc_admin_auth", "authenticated", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
        return { success: true };
      }
    } catch {
      // Fall through to error
    }
  }

  return {
    success: false,
    error: ccRes.error || "Invalid username, email, or password.",
  };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(CC_SESSION_COOKIE);
  cookieStore.delete("cpc_admin_auth");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  redirect("/admin-login");
}

export async function getActiveCCUser() {
  return await getCurrentCCSession();
}
