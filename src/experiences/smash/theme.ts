// SMASH — local theme constants. Colors live in the registry tokens; this file
// only holds composition-level copy + layout knobs specific to the experience.

/** Ticker strips that crawl across the page (no invented figures). */
export const TICKER_WORDS = [
  "SMASH",
  "PRENSADA AL HIERRO",
  "BORDES CRUJIENTES",
  "DOBLE QUESO",
  "NEON KITCHEN",
  "PEDIDO EN 1 TAP",
] as const;

/** Draggable sticker labels — playful, neutral, no claims. */
export const STICKERS: { id: string; label: string; tone: "accent" | "accent2" }[] = [
  { id: "st-smash", label: "SMASH!", tone: "accent" },
  { id: "st-cheese", label: "EXTRA QUESO", tone: "accent2" },
  { id: "st-hot", label: "★ ★ ★", tone: "accent" },
  { id: "st-grill", label: "AL HIERRO", tone: "accent2" },
];

/** Hero stamp order (front to back when assembled). Maps to manifest layers. */
export const STAMP_DELAYS = [0.0, 0.12, 0.24, 0.36, 0.48] as const;
