"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useExperience } from "./ExperienceProvider";
import type { ExperienceId } from "./registry";

// Only SMASH ships. Code-split so the heavy client bundle loads on demand.
const REGISTRY: Record<ExperienceId, ComponentType> = {
  smash: dynamic(() => import("./smash"), { ssr: false }),
};

export function ActiveExperience() {
  const { id } = useExperience();
  const Experience = REGISTRY[id];
  return <Experience />;
}
