"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Accessible tooltip: shows on hover and keyboard focus, dismisses on Escape,
 * and is wired with aria-describedby. Token-styled bubble with a caret.
 */
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const reduce = useReducedMotion();
  const id = useId();
  const [open, setOpen] = useState(false);
  const pos =
    side === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : "top-full mt-2 left-1/2 -translate-x-1/2";

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={open ? id : undefined}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-[var(--radius)] border border-[var(--color-muted)]/20 bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text)] shadow-lg ${pos}`}
            initial={{ opacity: 0, y: reduce ? 0 : side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : side === "top" ? 4 : -4 }}
            transition={{ duration: 0.16 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
