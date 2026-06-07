"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "./env";

// Browser-side Supabase client. Returns `null` (instead of throwing) when the
// project has no Supabase env configured, so the public site keeps working on
// the mock layer and the admin UI can show a "configure Supabase" notice.

let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}

export { hasSupabaseEnv };
