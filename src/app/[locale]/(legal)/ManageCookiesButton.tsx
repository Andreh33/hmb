"use client";

// Re-opens the cookie consent banner so users can revisit their choice from
// the cookie policy. Fires the event the banner listens for.
import { REOPEN_CONSENT_EVENT } from "@/shared/ui/CookieBanner";

export function ManageCookiesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT))}
      className="mt-4 rounded-[var(--radius)] border border-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      {label}
    </button>
  );
}
