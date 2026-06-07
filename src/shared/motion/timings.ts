import type { MotionFeel } from "@/experiences/registry";
import type { EaseName } from "./easings";

export interface FeelSpec {
  /** Base duration in seconds. */
  duration: number;
  /** Stagger between siblings in seconds. */
  stagger: number;
  ease: EaseName;
  spring?: { stiffness: number; damping: number; mass?: number };
}

// Per-feel timing presets. See §8.
export const FEEL: Record<MotionFeel, FeelSpec> = {
  weighty: { duration: 0.95, stagger: 0.07, ease: "lux" },
  elegant: { duration: 1.1, stagger: 0.08, ease: "lux" },
  snappy: {
    duration: 0.28,
    stagger: 0.04,
    ease: "snap",
    spring: { stiffness: 520, damping: 30 },
  },
  bouncy: {
    duration: 0.5,
    stagger: 0.06,
    ease: "back",
    spring: { stiffness: 380, damping: 14, mass: 1 },
  },
  continuous: { duration: 0.8, stagger: 0.05, ease: "soft" },
};

export function feelFor(feel: MotionFeel): FeelSpec {
  return FEEL[feel];
}
