"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useExperience } from "./ExperienceProvider";
import type { ExperienceId } from "./registry";

// Each experience is code-split: only the active one ships to the client.
const REGISTRY: Record<ExperienceId, ComponentType> = {
  ember: dynamic(() => import("./ember"), { ssr: false }),
  smash: dynamic(() => import("./smash"), { ssr: false }),
  diner: dynamic(() => import("./diner"), { ssr: false }),
  prime: dynamic(() => import("./prime"), { ssr: false }),
  nova: dynamic(() => import("./nova"), { ssr: false }),
};

export function ActiveExperience() {
  const { id } = useExperience();
  const Experience = REGISTRY[id];
  return <Experience />;
}
