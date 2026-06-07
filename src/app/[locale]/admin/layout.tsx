import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { getServerSupabase, hasSupabaseEnv } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { LoginForm } from "./LoginForm";

// Protected admin shell. SSR session check:
//  - no env       -> "configure Supabase" notice
//  - no session   -> magic-link login form
//  - session      -> renders the admin children with a sign-out control

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const shellStyle = {
    background: "var(--color-bg, #0a0a0a)",
    color: "var(--color-text, #f5f5f5)",
    minHeight: "100dvh",
  } as const;

  if (!hasSupabaseEnv()) {
    return (
      <main style={shellStyle} className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-[var(--display)] text-3xl tracking-tight">Admin</h1>
        <div
          className="mt-8 rounded-[var(--radius,12px)] border border-[var(--color-accent,#e25822)]/40 p-6"
          style={{ background: "var(--color-surface, #141414)" }}
        >
          <p className="text-lg font-medium">Configura Supabase</p>
          <p className="mt-2 text-sm opacity-80">
            Define las variables de entorno{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            y{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            y aplica{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5">
              docs/supabase-schema.sql
            </code>{" "}
            para activar el panel. Mientras tanto, el sitio funciona con datos de
            demostración.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await getServerSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <main style={shellStyle} className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-[var(--display)] text-3xl tracking-tight">Admin</h1>
        <p className="mt-2 text-sm opacity-70">
          Accede con un enlace mágico a tu correo.
        </p>
        <LoginForm />
      </main>
    );
  }

  return (
    <main style={shellStyle} className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-[var(--display)] text-3xl tracking-tight">
            Panel de administración
          </h1>
          <p className="text-sm opacity-60">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-[var(--radius,10px)] border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </main>
  );
}
