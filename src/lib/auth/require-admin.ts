import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCurrentCCSession } from "@/lib/auth/cc-auth";

/**
 * Server guard for Admin API routes and actions.
 */
export async function requireCoreCommittee(): Promise<
  | { ok: true; memberId: string; name?: string; role?: string }
  | { ok: false; status: number; message: string }
> {
  try {
    // 1. Check Cryptographically signed Core Committee Session
    const ccSession = await getCurrentCCSession();
    if (ccSession) {
      return {
        ok: true,
        memberId: ccSession.memberId,
        name: ccSession.name,
        role: ccSession.role,
      };
    }

    // 2. Check Supabase authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return { ok: true, memberId: user.id, name: user.email?.split("@")[0] || "Admin" };
    }

    // 3. Fallback admin cookie
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get("cpc_admin_auth")?.value;
    if (adminAuthCookie === "authenticated") {
      return { ok: true, memberId: "admin-passcode", name: "Core Committee Member" };
    }

    return { ok: false, status: 401, message: "Unauthorized" };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

/**
 * Server-page level guard for Admin-only routes.
 */
export async function requireAdmin() {
  const auth = await requireCoreCommittee();
  if (!auth.ok) {
    const { redirect } = await import("next/navigation");
    redirect("/admin-login");
    throw new Error("Redirecting");
  }
  return {
    id: auth.memberId,
    name: auth.name || "Core Committee Admin",
    role: auth.role || "Executive Member",
    is_core_committee: true,
    status: "active",
  };
}

/**
 * Server-page level details for dashboard views.
 */
export async function getDashboardUser() {
  const user = await requireAdmin();
  return {
    member: user,
    isAdmin: true,
  };
}
