"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useScroll } from "@/shared/scroll/scroll-store";

/**
 * A header that morphs from a full-width transparent bar at the top of the page
 * into a compact floating pill once the user scrolls past a threshold. Reads
 * the scroll store and commits a boolean state only on threshold crossings.
 */
export function MorphNav({
  brand,
  children,
  threshold = 0.04,
}: {
  brand: ReactNode;
  children?: ReactNode;
  threshold?: number;
}) {
  const reduce = useReducedMotion();
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = useScroll.getState().progress;
      setCondensed((c) => {
        const next = p > threshold;
        return next === c ? c : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [threshold]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.header
        className="pointer-events-auto relative flex items-center gap-6"
        animate={{
          width: condensed ? "auto" : "100%",
          borderRadius: condensed ? 999 : 4,
          paddingLeft: condensed ? 20 : 8,
          paddingRight: condensed ? 20 : 8,
        }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
        style={{ paddingTop: 10, paddingBottom: 10, maxWidth: 1100 }}
      >
        {/* Animated backdrop: invisible at top, frosted pill once condensed. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 border border-[var(--color-muted)]/25 bg-[var(--color-surface)]/80 backdrop-blur"
          style={{ borderRadius: "inherit" }}
          animate={{ opacity: condensed ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
        />
        <span className="font-display text-xl">{brand}</span>
        <div className="ml-auto flex items-center gap-4 text-sm">{children}</div>
      </motion.header>
    </div>
  );
}
