"use client";

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
    <ExperienceProvider initial={initialExperience}>
      <SmoothScroll>{children}</SmoothScroll>
      <ExperienceTransition />
    </ExperienceProvider>
  );
}
