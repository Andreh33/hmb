// SEAR — Experience registry. The single source of truth for the 5 experiences.
// Each experience is a whole different "website": layout, type, palette, motion.

export type ExperienceId = "ember" | "smash" | "diner" | "prime" | "nova";

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

export const DEFAULT_EXPERIENCE: ExperienceId = "ember";

export const EXPERIENCE_ORDER: ExperienceId[] = [
  "ember",
  "smash",
  "diner",
  "prime",
  "nova",
];

export const EXPERIENCES: Record<ExperienceId, ExperienceMeta> = {
  ember: {
    id: "ember",
    brand: "EMBER",
    tagline: "Cinematic dark gourmet",
    mode: "dark",
    colors: {
      bg: "#0B0A09",
      surface: "#16130F",
      text: "#F3EBDD",
      muted: "#A89A85",
      accent: "#E0992F",
      accent2: "#8C1C13",
      glaze: "#E0992F",
    },
    fonts: { display: "var(--font-fraunces)", body: "var(--font-geist)" },
    radius: "2px",
    glow: 0.35,
    grain: true,
    motionFeel: "weighty",
    heroMode: "frames",
  },
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
    heroMode: "layered",
  },
  diner: {
    id: "diner",
    brand: "RUTA 66",
    tagline: "Retro americana, físicas reales",
    mode: "light",
    colors: {
      bg: "#F4E9D8",
      surface: "#FBF4E8",
      text: "#2A1E16",
      muted: "#6B5847",
      accent: "#C2362B",
      accent2: "#E0A93B",
      glaze: "#D98E2B",
    },
    fonts: { display: "var(--font-alfa)", body: "var(--font-dmsans)" },
    radius: "10px",
    glow: 0.2,
    grain: true,
    motionFeel: "bouncy",
    heroMode: "layered",
  },
  prime: {
    id: "prime",
    brand: "PRIME",
    tagline: "Editorial luxury, fluid WebGL",
    mode: "light",
    colors: {
      bg: "#F7F5F1",
      surface: "#FFFFFF",
      text: "#1C1A17",
      muted: "#8A8378",
      accent: "#6E1423",
      accent2: "#B98A3E",
      glaze: "#C98A3E",
    },
    fonts: { display: "var(--font-cormorant)", body: "var(--font-hanken)" },
    radius: "0px",
    glow: 0.15,
    grain: false,
    motionFeel: "elegant",
    heroMode: "still",
  },
  nova: {
    id: "nova",
    brand: "NOVA",
    tagline: "Immersive particle showpiece",
    mode: "dark",
    colors: {
      bg: "#07070D",
      surface: "#11111F",
      text: "#FFFFFF",
      muted: "#8888A0",
      accent: "#FF6A2C",
      accent2: "#36C5FF",
      glaze: "#FFB347",
    },
    fonts: { display: "var(--font-bricolage)", body: "var(--font-geist)" },
    radius: "4px",
    glow: 1,
    grain: false,
    motionFeel: "continuous",
    heroMode: "still",
  },
};

export function getExperience(id: ExperienceId): ExperienceMeta {
  return EXPERIENCES[id];
}

export function isExperienceId(value: string): value is ExperienceId {
  return value in EXPERIENCES;
}
