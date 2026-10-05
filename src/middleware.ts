import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from "@/lib/constants/env-defaults";

/**
 * Runs on every request. Refreshes the Supabase auth session and blocks
 * unauthenticated access to /admin/*. Core-committee membership itself
 * (members.is_core_committee) is re-checked server-side on each admin
 * page/action via RLS — this middleware is just the login gate.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const adminCookie = request.cookies.get("cpc_admin_auth")?.value;
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin-login");

  let user = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const isMock = !url || !key || url.includes("xyz.supabase.co") || url.includes("htotagahzvesuweovegq") || url.includes("mock") || key.includes("mock");

  if (!isMock) {
    try {
      const supabase = createServerClient(
        url,
        key,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: any) {
              cookiesToSet.forEach(({ name, value }: any) => request.cookies.set(name, value));
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }: any) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  const adminSession = request.cookies.get("cpc_admin_session")?.value;
  const hasAdminAuth = Boolean(user || adminSession || adminCookie === "authenticated");

  if (isAdminRoute && !hasAdminAuth) {
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and image optimization files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)",
  ],
};
