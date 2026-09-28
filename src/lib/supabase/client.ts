import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

function isMockSupabase(url?: string | null, key?: string | null): boolean {
  if (!url || !key) return true;
  return (
    url.includes("xyz.supabase.co") ||
    url.includes("htotagahzvesuweovegq") ||
    url.includes("mock") ||
    key.includes("mock")
  );
}

function createBrowserMockBuilder(): any {
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

/**
 * Supabase client for use in Client Components ("use client").
 * Safe to call multiple times — @supabase/ssr handles singleton behavior
 * per-request on the server and per-tab in the browser.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isMockSupabase(url, key)) {
    return {
      from: () => createBrowserMockBuilder(),
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
      },
    } as any;
  }

  return createBrowserClient<Database>(
    url!,
    key!
  );
}
