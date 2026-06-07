"use client";

import { useId } from "react";
import { motion } from "motion/react";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A segmented pill control with a shared layout-animated "thumb" that glides
 * between options (motion layoutId). Keyboard + radiogroup semantics.
 */
export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  const groupId = useId();
  return (
    <div
      role="radiogroup"
      aria-label="Toggle"
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--color-muted)]/25 bg-[var(--color-surface)]/70 p-1 backdrop-blur ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-text)]"
            style={{ color: active ? "var(--color-bg)" : "var(--color-text)" }}
          >
            {active && (
              <motion.span
                layoutId={`pill-${groupId}`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-[var(--color-accent)]"
                transition={{ type: "spring", stiffness: 480, damping: 34 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
