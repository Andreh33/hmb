// PRIME — art direction helpers. Derives the duotone palette and fluid glaze
// color for the hero from the active experience meta, so the WebGL stays on
// brand if tokens are re-tuned. SSR-safe, pure.

import type { ExperienceColors } from "@/experiences/registry";

export interface PrimeArt {
  /** Duotone shadow (deep ink). */
  shadow: string;
  /** Duotone highlight (warm gilt). */
  highlight: string;
  /** Fluid glaze tint. */
  glaze: string;
  /** Tonal contrast feeding the duotone shader. */
  contrast: number;
}

/**
 * PRIME reads as a gilt editorial plate: deep claret/ink shadows lifting into a
 * burnished gold highlight. We bias the shadow toward the brand accent (claret)
 * so the duotone never goes muddy-grey.
 */
export function primeArt(colors: ExperienceColors): PrimeArt {
  return {
    shadow: colors.text, // near-black ink (#1C1A17)
    highlight: colors.accent2, // burnished gold (#B98A3E)
    glaze: colors.glaze, // gilt fluid tint (#C98A3E)
    contrast: 1.18,
  };
}
