"use client";

import { MotionConfig } from "motion/react";
import { ExperienceProvider } from "@/experiences/ExperienceProvider";
import { SmoothScroll } from "@/shared/scroll/SmoothScroll";
import { ExperienceTransition } from "@/experiences/ExperienceTransition";
import type { ExperienceId } from "@/experiences/registry";

export function Providers({
  initialExperience,
  children,
}: {
  initialExperience: ExperienceId;
  children: React.ReactNode;
}) {
  return (
    // reducedMotion="never" forces useReducedMotion() to always return false
    // across every Motion component — full motion always plays (per spec §16:
    // "prima el impacto", reduced-motion is NOT honoured).
    <MotionConfig reducedMotion="never">
      <ExperienceProvider initial={initialExperience}>
        <SmoothScroll>{children}</SmoothScroll>
        <ExperienceTransition />
      </ExperienceProvider>
    </MotionConfig>
  );
}
