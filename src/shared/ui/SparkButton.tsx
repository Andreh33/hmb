"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface Spark {
  id: number;
  angle: number;
  dist: number;
}

/**
 * Click emits a radial burst of accent sparks from the cursor — a celebratory
 * micro-interaction for "add to order" CTAs. Respects reduced-motion.
 */
export function SparkButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const seed = useRef(0);
  const [sparks, setSparks] = useState<Spark[]>([]);

  function burst() {
    onClick?.();
    if (reduce) return;
    const batch: Spark[] = Array.from({ length: 12 }, (_, i) => ({
      id: seed.current++,
      angle: (i / 12) * Math.PI * 2 + Math.random() * 0.4,
      dist: 26 + Math.random() * 22,
    }));
    setSparks((s) => [...s, ...batch]);
    window.setTimeout(
      () => setSparks((s) => s.filter((sp) => !batch.includes(sp))),
      650,
    );
  }

  return (
    <button
      type="button"
      onClick={burst}
      className={`sear-glow relative inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent)] px-7 py-3.5 font-medium text-[var(--color-bg)] outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[var(--color-glaze)]"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(s.angle) * s.dist,
              y: Math.sin(s.angle) * s.dist,
              opacity: 0,
              scale: 0.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
