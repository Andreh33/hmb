"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_ARR } from "@/shared/motion/easings";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rot: number;
  delay: number;
  color: string;
}

const CONFETTI_COLORS = [
  "var(--color-accent)",
  "var(--color-accent2)",
  "var(--color-glaze)",
];

// Deterministic spread (golden-ratio scatter) so the burst looks varied without
// calling impure Math.random during render. Computed once via lazy init.
function buildPieces(): ConfettiPiece[] {
  const N = 18;
  return Array.from({ length: N }, (_, i) => {
    const a = ((i * 0.618033) % 1) * Math.PI * 2;
    const spread = ((i * 0.381966) % 1) - 0.5;
    return {
      id: i,
      x: spread * 240,
      y: -70 - Math.abs(Math.sin(a)) * 60,
      rot: (i * 47) % 360,
      delay: (i % 6) * 0.02,
      color: CONFETTI_COLORS[i % 3] ?? "var(--color-accent)",
    };
  });
}

/**
 * A self-dismissing toast that fires a short confetti burst on appear. Purely
 * controlled by `open`; the parent flips it. Confetti uses token colors and is
 * suppressed under reduced-motion.
 */
export function ConfettiToast({
  open,
  message,
  onDismiss,
  duration = 2600,
}: {
  open: boolean;
  message: ReactNode;
  onDismiss: () => void;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [pieces] = useState<ConfettiPiece[]>(buildPieces);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center" role="status" aria-live="polite">
      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-auto relative flex items-center gap-3 rounded-[var(--radius)] border border-[var(--color-muted)]/20 bg-[var(--color-surface)] px-5 py-3 shadow-xl"
            initial={{ opacity: 0, y: 24, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE_ARR.back }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden />
            <span className="text-sm">{message}</span>
            {!reduce &&
              pieces.map((p) => (
                <motion.span
                  key={p.id}
                  aria-hidden
                  className="absolute left-1/2 top-0 h-2 w-1.5"
                  style={{ background: p.color, borderRadius: 1 }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot }}
                  transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Minimal controller hook for one-off confetti toasts. */
export function useConfettiToast() {
  const [state, setState] = useState<{ open: boolean; message: ReactNode }>({
    open: false,
    message: "",
  });
  return {
    open: state.open,
    message: state.message,
    fire: (message: ReactNode) => setState({ open: true, message }),
    dismiss: () => setState((s) => ({ ...s, open: false })),
  };
}
