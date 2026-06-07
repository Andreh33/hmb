// NOVA — local design tokens. Reads the experience CSS vars set by
// ExperienceProvider.applyExperienceVars but freezes the few literal values the
// R3F scene needs (Three can't read CSS vars). Single source for the look.

import { EXPERIENCES } from "@/experiences/registry";

const NOVA = EXPERIENCES.nova.colors;

/** Literal palette mirrored for the WebGL scene (Three needs hex, not CSS vars). */
export const NOVA_COLORS = {
  bg: NOVA.bg, // #07070D
  surface: NOVA.surface, // #11111F
  text: NOVA.text, // #FFFFFF
  muted: NOVA.muted, // #8888A0
  accent: NOVA.accent, // #FF6A2C — solar orange
  accent2: NOVA.accent2, // #36C5FF — plasma cyan
  glaze: NOVA.glaze, // #FFB347
} as const;

/** Tailwind/CSS var helpers so DOM stays on the shared token system. */
export const v: Record<
  "bg" | "surface" | "text" | "muted" | "accent" | "accent2" | "glaze",
  string
> = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  accent: "var(--color-accent)",
  accent2: "var(--color-accent2)",
  glaze: "var(--color-glaze)",
} as const;

/**
 * The five "stations" of the NOVA journey. Each is a scroll act; the DOM floats
 * over a single persistent canvas while the camera/particles transform between
 * them. Real text (indexable) lives in the DOM, not the canvas.
 */
export const STATIONS = [
  "ignition", // hero — still photo coalesces from particles
  "menu", // the carta, particles drift behind
  "forge", // build-your-burger — chosen items compose by particles
  "story", // brand statement
  "location", // address + hours
] as const;

export type Station = (typeof STATIONS)[number];
