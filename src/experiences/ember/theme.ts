// EMBER — Cinematic Dark Gourmet. Local design constants for this experience.
// Palette lives in tokens (var(--color-accent) = gold, --color-accent2 = ember
// red, --color-glaze = warm gold). These are the *motion + layout* constants
// that give EMBER its weighty, hand-graded film feel.

/** Number of hero frames in the assembling-burger sequence. */
export const HERO_FRAME_COUNT = 48;

/** Cinematic settle curve — slow, expensive. Matches EASE.lux. */
export const EMBER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EMBER_EASE_GSAP = "power4.out";

/** Headline that ignites letter-by-letter in the hero. */
export const HERO_HEADLINE = ["BRASA", "VIVA"];
export const HERO_KICKER = "Carbón · Carne madurada · Fuego abierto";

/** Editorial ingredient call-outs for the rotation stage (neutral, no claims). */
export interface EmberIngredient {
  id: string;
  label: { es: string; en: string };
  note: { es: string; en: string };
  /** Angle (deg) where the SVG leader line anchors around the stage. */
  angle: number;
  /** Radial distance 0..1 of the label from stage centre. */
  reach: number;
}

export const EMBER_INGREDIENTS: EmberIngredient[] = [
  {
    id: "bun",
    label: { es: "Brioche dorado", en: "Golden brioche" },
    note: { es: "Horneado cada mañana", en: "Baked every morning" },
    angle: -58,
    reach: 0.92,
  },
  {
    id: "beef",
    label: { es: "Carne madurada", en: "Aged beef" },
    note: { es: "Sellada al carbón", en: "Charcoal-seared" },
    angle: 18,
    reach: 1,
  },
  {
    id: "cheese",
    label: { es: "Cheddar curado", en: "Aged cheddar" },
    note: { es: "Fundido sobre la brasa", en: "Melted over embers" },
    angle: 142,
    reach: 0.9,
  },
  {
    id: "onion",
    label: { es: "Cebolla al carbón", en: "Charred onion" },
    note: { es: "Caramelizada al fuego", en: "Fire-caramelised" },
    angle: -148,
    reach: 0.96,
  },
];

/** Neutral location counters — descriptive, not invented figures (§0.6). */
export interface EmberStat {
  id: string;
  to: number;
  suffix: string;
  label: { es: string; en: string };
}

export const EMBER_STATS: EmberStat[] = [
  { id: "fire", to: 540, suffix: "°", label: { es: "Brasa de encina", en: "Oak-charcoal sear" } },
  { id: "age", to: 45, suffix: "d", label: { es: "Maduración", en: "Dry-age" } },
  { id: "hours", to: 12, suffix: "h", label: { es: "Cocina abierta", en: "Open kitchen" } },
];

/** Short story beats for the horizontal film tram. */
export const EMBER_STORY = [
  {
    kicker: { es: "01 — Origen", en: "01 — Origin" },
    line: { es: "Empieza con fuego. Carbón de encina, parrilla al rojo.", en: "It begins with fire. Oak charcoal, grill glowing red." },
  },
  {
    kicker: { es: "02 — Materia", en: "02 — Matter" },
    line: { es: "Carne madurada cuarenta y cinco días. Sin atajos.", en: "Beef aged forty-five days. No shortcuts." },
  },
  {
    kicker: { es: "03 — Sello", en: "03 — Sear" },
    line: { es: "Un sellado y una vuelta. La corteza lo es todo.", en: "One sear, one turn. The crust is everything." },
  },
  {
    kicker: { es: "04 — Mesa", en: "04 — Table" },
    line: { es: "Llega a la mesa todavía crepitando.", en: "It reaches the table still crackling." },
  },
];
