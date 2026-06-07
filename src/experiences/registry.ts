// SEAR — Experience registry. Single source of truth.
// Pared down to the SMASH experience only (per client request).

export type ExperienceId = "smash";

export type MotionFeel =
  | "weighty"
  | "snappy"
  | "bouncy"
  | "elegant"
  | "continuous";

export type HeroMode = "frames" | "layered" | "still";

export interface ExperienceColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  glaze: string;
}

export interface ExperienceMeta {
  id: ExperienceId;
  brand: string;
  tagline: string;
  mode: "dark" | "light";
  colors: ExperienceColors;
  /** CSS font-family stacks. Wired to the variable fonts loaded in the root layout. */
  fonts: { display: string; body: string };
  radius: string;
  glow: number;
  grain: boolean;
  motionFeel: MotionFeel;
  /** Preferred hero mode; HeroStage degrades to 'still' if material is missing. */
  heroMode: HeroMode;
}

export const DEFAULT_EXPERIENCE: ExperienceId = "smash";

export const EXPERIENCE_ORDER: ExperienceId[] = ["smash"];

export const EXPERIENCES: Record<ExperienceId, ExperienceMeta> = {
  smash: {
    id: "smash",
    brand: "SMASH",
    tagline: "Brutalist neon kinetic",
    mode: "dark",
    colors: {
      bg: "#0E0E10",
      surface: "#1A1A1E",
      text: "#FFFFFF",
      muted: "#9A9AA2",
      accent: "#FF2D2D",
      accent2: "#F5D311",
      glaze: "#FFB020",
    },
    fonts: { display: "var(--font-clash)", body: "var(--font-satoshi)" },
    radius: "0px",
    glow: 0.9,
    grain: false,
    motionFeel: "snappy",
    heroMode: "still",
  },
};

export function getExperience(id: ExperienceId): ExperienceMeta {
  return EXPERIENCES[id];
}

export function isExperienceId(value: string): value is ExperienceId {
  return value in EXPERIENCES;
}
