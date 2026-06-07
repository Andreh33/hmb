"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useConfetti } from "./fly-to-cart";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * Lightweight confetti burst + toast triggered by `emitConfetti()`.
 * Local to the convert module (A-GALLERY may also call `emitConfetti`; this
 * stays the single visual owner so bursts never double up). No canvas / no
 * external confetti lib — pure motion DOM particles, GPU-friendly.
 */

interface Piece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  size: number;
}

const COLORS = [
  "var(--color-accent)",
  "var(--color-accent2)",
  "var(--color-glaze)",
  "#ffd166",
];

function makePieces(seed: number): Piece[] {
  // deterministic-ish spread, generated client-side on demand
  return Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 60 + ((i * 37 + seed) % 70);
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 30,
      rotate: ((i * 53 + seed) % 360) - 180,
      color: COLORS[i % COLORS.length] ?? "var(--color-accent)",
      size: 6 + ((i * 13 + seed) % 6),
    };
  });
}

export function ConfettiToast({
  message,
}: {
  /** Toast copy. Caller passes a localised string; defaults are neutral. */
  message?: string;
}) {
  const [burst, setBurst] = useState(0); // increments per trigger -> remount
  const [visible, setVisible] = useState(false);
  const baseId = useId();
  const timer = useRef<number | undefined>(undefined);

  const onConfetti = useCallback(() => {
    setBurst((b) => b + 1);
    setVisible(true);
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 1700);
  }, []);

  useConfetti(onConfetti);

  const pieces = useMemo(() => makePieces(burst * 911), [burst]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-6 z-[90] flex justify-center"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={`toast-${burst}`}
            initial={{ y: -24, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_ARR.back }}
            className="relative"
          >
            <span className="block rounded-full border border-[var(--color-muted)]/20 bg-[var(--color-surface)]/90 px-5 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-[var(--glow)] backdrop-blur-md">
              {message ?? "Añadido a tu pedido"}
            </span>
            {pieces.map((p) => (
              <motion.span
                key={`${baseId}-${burst}-${p.id}`}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  rotate: p.rotate,
                  scale: 0.6,
                }}
                transition={{ duration: 1, ease: EASE_ARR.lux }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: p.size,
                  height: p.size * 0.6,
                  borderRadius: 2,
                  background: p.color,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
