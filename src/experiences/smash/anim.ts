"use client";

// SMASH — shared motion vocabulary. One source of truth so every section eases
// the same way (cohesion is what reads as "designed" vs "assembled"). Built ON
// TOP of the shared EASE/FEEL tokens — never a parallel dialect.

import { EASE, EASE_ARR } from "@/shared/motion/easings";
import { feelFor } from "@/shared/motion/timings";

/** SMASH is "snappy" in the registry — resolve once, reuse everywhere. */
export const FEEL = feelFor("snappy");

/** Motion (framer) transition presets, all derived from the snappy feel. */
export const T = {
  /** Hard mechanical snap for stamps / impacts. */
  slam: { type: "spring" as const, stiffness: 900, damping: 26, mass: 0.9 },
  /** Punchy UI spring for stickers / toggles. */
  pop: { type: "spring" as const, stiffness: 460, damping: 22 },
  /** Scrub-settled reveal (rows, blocks). Snap bezier, no overshoot. */
  reveal: { duration: 0.55, ease: EASE_ARR.snap },
  /** Slow luxurious settle for the big type. */
  lux: { duration: 0.9, ease: EASE_ARR.lux },
} as const;

/** CSS easing strings for hover / transition utilities (kept in lockstep). */
export const CSS_EASE = EASE;

/** Stagger step used across grids/lists. */
export const STEP = FEEL.stagger;

/** Velocity-skew factor knobs, tuned per surface so the whole page leans as one
 * coherent material instead of every element flexing at its own rate. */
export const SKEW = {
  heading: { factor: 0.28, max: 7 },
  quote: { factor: 0.22, max: 6 },
  body: { factor: 0.16, max: 4 },
} as const;
