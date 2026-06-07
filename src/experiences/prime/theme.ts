// PRIME — Editorial Luxury design constants.
//
// Not a re-export of tokens (those live in CSS vars / registry). This is the
// PRIME *layout grammar*: the brutal negative space, the hairline rules, the
// editorial type rhythm and the column system that make the museum feel.
//
// SSR-safe: pure data, no side effects, no "use client".

/** Hairline rule — PRIME's signature 1px divider, drawn in muted ink. */
export const RULE = "1px solid color-mix(in srgb, var(--color-text) 16%, transparent)";
export const RULE_FAINT =
  "1px solid color-mix(in srgb, var(--color-text) 9%, transparent)";

/** Editorial display tracking — Cormorant wants air, not crush. */
export const DISPLAY_TRACK = "-0.01em";
/** Eyebrow / label tracking — wide-set caps for the gallery captions. */
export const LABEL_TRACK = "0.34em";

/** Wide content measure used across the museum sections. */
export const MEASURE = "min(92vw, 1320px)";
/** Reading measure for body prose blocks. */
export const PROSE = "min(88vw, 56ch)";

/**
 * PRIME section ids — kept in scroll order. Used for the ScrollFilm acts,
 * anchor links and the side index. The hero is the overture (act 0).
 */
export const PRIME_SECTIONS = [
  { id: "prime-hero", label: "I" },
  { id: "prime-manifesto", label: "II" },
  { id: "carta", label: "III" },
  { id: "historia", label: "IV" },
  { id: "ubicacion", label: "V" },
] as const;

export type PrimeSectionId = (typeof PRIME_SECTIONS)[number]["id"];

/** A roman-numeral folio for a 0-based index (gallery-plate numbering). */
export function folio(index: number): string {
  const numerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = index + 1;
  let out = "";
  for (const [value, sym] of numerals) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out;
}
