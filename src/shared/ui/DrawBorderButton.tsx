"use client";

import { type ReactNode } from "react";

/**
 * On hover the border draws itself stroke-by-stroke around the perimeter using
 * an animated SVG rect. Crisp at any size; degrades to a static border if
 * motion is reduced (handled via CSS media query in the dash animation).
 */
export function DrawBorderButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-[var(--radius)] px-7 py-3.5 font-medium text-[var(--color-text)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${className}`}
    >
      <span className="absolute inset-0 rounded-[var(--radius)] border border-[var(--color-muted)]/25" />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="none"
      >
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="var(--radius)"
          stroke="var(--color-accent)"
          strokeWidth="2"
          pathLength={1}
          className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
      <span className="relative transition-colors duration-300 group-hover:text-[var(--color-accent)]">
        {children}
      </span>
    </button>
  );
}
