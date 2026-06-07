import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Magic-link / OAuth callback. Exchanges the `code` for a session and writes
// the auth cookies, then redirects back into the admin. The supabase server
// client's setAll is writable inside a route handler.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
