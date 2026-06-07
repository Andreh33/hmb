"use client";

import { useRef, type ReactNode } from "react";

/**
 * A surface with an accent radial spotlight that follows the pointer, plus a
 * subtly lit border. Uses CSS custom props mutated imperatively — no React
 * re-render on move, so it stays at 60fps.
 */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--on", "1");
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => ref.current?.style.setProperty("--on", "0")}
      className={`group relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] ${className}`}
      style={{ ["--on" as string]: "0" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "var(--on)",
          background:
            "radial-gradient(220px circle at var(--mx) var(--my), color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
