"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "@/shared/motion/timings";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * A card that reveals on scroll: a token-colored "curtain" wipes away to expose
 * the content, timed to the active experience's motion feel.
 */
export function RevealCard({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const shown = inView || reduce;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: f.duration, ease: EASE_ARR[f.ease], delay: delay + f.duration * 0.4 }}
      >
        {children}
      </motion.div>
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-bottom bg-[var(--color-accent)]"
          initial={{ scaleY: 1 }}
          animate={shown ? { scaleY: 0 } : undefined}
          transition={{ duration: f.duration, ease: EASE_ARR[f.ease], delay }}
        />
      )}
    </div>
  );
}
