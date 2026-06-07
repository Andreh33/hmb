// Centralised env detection for Supabase.
// When the env vars are absent (demo / build without a backend) we degrade
// gracefully to the mock layer instead of crashing.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both public env vars are present and non-empty. */
export function hasSupabaseEnv(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
