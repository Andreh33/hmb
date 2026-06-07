"use client";

import { useScroll } from "@/shared/scroll/scroll-store";
import { PRIME_SECTIONS } from "../theme";

/**
 * PRIME folio rail — a fixed vertical index of roman folios down the right
 * margin (desktop). The active act ticks to gilt and grows a marker rule. Reads
 * the shared scroll act from the store; clicking a folio scrolls to its section.
 */
export function PrimeFolioRail() {
  // ScrollFilm act index maps 1:1 to our acts; clamp to the 5 indexed sections.
  // Selector returns a primitive, so this re-renders only when the act changes.
  const active = useScroll((s) =>
    Math.min(s.act, PRIME_SECTIONS.length - 1),
  );

  return (
    <nav
      aria-label="Índice"
      className="fixed right-[clamp(0.75rem,2vw,1.75rem)] top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      {PRIME_SECTIONS.map((s, i) => {
        const on = i === active;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-cursor="hover"
            className="group flex items-center gap-3"
            aria-current={on ? "true" : undefined}
          >
            <span
              className="font-display text-[0.78rem] tabular-nums transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[var(--color-text)]"
              style={{
                letterSpacing: "0.12em",
                color: on ? "var(--color-accent)" : "var(--color-muted)",
                opacity: on ? 1 : 0.45,
                transform: on ? "translateX(0)" : "translateX(2px)",
              }}
            >
              {s.label}
            </span>
            <span
              className="block h-px transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:!w-[34px]"
              style={{
                width: on ? 34 : 12,
                background: on ? "var(--color-accent)" : "var(--color-muted)",
                opacity: on ? 1 : 0.35,
              }}
            />
          </a>
        );
      })}
    </nav>
  );
}
