import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function isMockSupabase(url?: string | null, key?: string | null): boolean {
  if (!url || !key) return true;
  return (
    url.includes("xyz.supabase.co") ||
    url.includes("htotagahzvesuweovegq") ||
    url.includes("mock") ||
    key.includes("mock")
  );
}

export function createMockBuilder(): any {
  const mock: any = new Proxy(() => {}, {
    get(target, prop) {
      if (prop === "then") {
        return (onfulfilled: any) => Promise.resolve({ data: [], error: null, count: 0 }).then(onfulfilled);
      }
      if (prop === "single" || prop === "maybeSingle") {
        return () => Promise.resolve({ data: null, error: null, count: 0 });
      }
      return () => mock;
    },
    apply(target, thisArg, argList) {
      return mock;
    }
  });
  return mock;
}

export function createMockClient(): any {
  return {
    from: () => createMockBuilder(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error("Mock storage") }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
      }),
      createBucket: () => Promise.resolve({ data: null, error: null }),
    },
  };
}

import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from "@/lib/constants/env-defaults";

/**
 * Supabase client for use in Server Components, Server Actions, and
 * Route Handlers. Reads/writes auth cookies via next/headers.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (isMockSupabase(url, key)) {
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore when
            // middleware is refreshing the session.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service role key. NEVER import this into
 * client-facing code paths — server-only (Route Handlers / Server Actions
 * that have already verified the caller is a core-committee member).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const key = serviceKey && !serviceKey.includes("mock") ? serviceKey : anonKey;

  if (isMockSupabase(url, key)) {
    return createMockClient();
  }

  return createSupabaseClient<Database>(
    url,
    key,
    { auth: { persistSession: false } }
  );
}
