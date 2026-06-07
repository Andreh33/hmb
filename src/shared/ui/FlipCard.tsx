"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A 3D flip card. Click or focus+Enter flips between front and back faces.
 * Under reduced-motion it cross-fades instead of rotating.
 */
export function FlipCard({
  front,
  back,
  className = "",
}: {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((v) => !v)}
      className={`relative block h-full w-full rounded-[var(--radius)] outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${className}`}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={reduce ? {} : { rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <Face hidden={!!reduce && flipped} className="[backface-visibility:hidden]">
          {front}
        </Face>
        <Face
          hidden={!!reduce && !flipped}
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {back}
        </Face>
      </motion.div>
    </button>
  );
}

function Face({
  children,
  className,
  hidden,
}: {
  children: ReactNode;
  className: string;
  hidden: boolean;
}) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] ${className}`}
      style={{ opacity: hidden ? 0 : 1 }}
    >
      {children}
    </div>
  );
}
