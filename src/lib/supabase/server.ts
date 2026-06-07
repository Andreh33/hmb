import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "./env";

// Server-side Supabase client bound to the Next.js cookie store (App Router).
// Returns `null` when env is absent so server queries can fall back to mock
// data and SSR keeps rendering without a backend.

export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!hasSupabaseEnv()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where setting cookies is not
          // allowed. Session refresh is handled by middleware / route handlers,
          // so it is safe to ignore here.
        }
      },
    },
  });
}

export { hasSupabaseEnv };
