import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Server guard for Admin API routes and actions.
 */
export async function requireCoreCommittee(): Promise<
  { ok: true; memberId: string } | { ok: false; status: number; message: string }
> {
  try {
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get("cpc_admin_auth")?.value;
    if (adminAuthCookie === "authenticated") {
      return { ok: true, memberId: "admin-passcode" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return { ok: true, memberId: user.id };
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
    name: "Core Committee Admin",
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

