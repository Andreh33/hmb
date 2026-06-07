"use client";

import { useActionState } from "react";
import { sendMagicLink, type ActionResult } from "./actions";

// Magic-link login form. Posts to the sendMagicLink server action.

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    sendMagicLink,
    null,
  );

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="opacity-70">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          className="mt-1 w-full rounded-[var(--radius,10px)] border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent,#e25822)]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius,10px)] bg-[var(--color-accent,#e25822)] px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar enlace de acceso"}
      </button>
      {state ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
