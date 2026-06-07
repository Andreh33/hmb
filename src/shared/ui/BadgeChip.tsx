import { type ReactNode } from "react";

/**
 * Small token-styled chip for badges/allergens/tags. Three tones map to the
 * experience palette. Pure presentational, no client runtime.
 */
export function BadgeChip({
  children,
  tone = "accent",
  className = "",
}: {
  children: ReactNode;
  tone?: "accent" | "muted" | "outline";
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent: "bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
    muted: "bg-[var(--color-muted)]/15 text-[var(--color-muted)]",
    outline: "border border-[var(--color-muted)]/40 text-[var(--color-muted)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${tones[tone] ?? tones.accent} ${className}`}
    >
      {children}
    </span>
  );
}
