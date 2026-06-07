"use client";

import { useEffect } from "react";
import { useExperience } from "./ExperienceProvider";
import { EXPERIENCE_ORDER, EXPERIENCES } from "./registry";

/**
 * The headline interaction: switch experience = switch to a whole different
 * website. Keyboard shortcuts 1–5 jump between them.
 */
export function ExperienceToggle() {
  const { id, setId } = useExperience();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= EXPERIENCE_ORDER.length) {
        const next = EXPERIENCE_ORDER[n - 1];
        if (next) setId(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setId]);

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-muted)]/25 bg-[var(--color-surface)]/70 p-1 backdrop-blur">
      {EXPERIENCE_ORDER.map((eid, i) => {
        const meta = EXPERIENCES[eid];
        const active = eid === id;
        return (
          <button
            key={eid}
            onClick={() => setId(eid)}
            aria-pressed={active}
            title={`${meta.brand} — ${meta.tagline} (${i + 1})`}
            className="relative rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition data-[active=true]:text-[var(--color-bg)]"
            data-active={active}
            style={
              active
                ? { background: "var(--color-accent)", color: "var(--color-bg)" }
                : undefined
            }
          >
            {meta.brand}
          </button>
        );
      })}
    </div>
  );
}
