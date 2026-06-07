// Hero is ALWAYS a photorealistic image (real photo or AI-generated), enhanced
// by WebGL. Never CGI food. The engine is agnostic to the image source; swap
// per client by dropping files in /public/hero/<client>/ + this manifest.

export type HeroMode = "frames" | "layered" | "still";

export interface HeroFrames {
  dir: string; // e.g. "/hero/demo/frames"
  count: number;
  pad: number; // zero-pad width, e.g. 4 -> 0001
  ext: "webp" | "avif";
}

export interface HeroLayer {
  src: string;
  depth: number; // 0..1, back to front
  label?: string;
}

export interface HeroManifest {
  mode: HeroMode;
  still: string; // ALWAYS present — universal fallback
  frames?: HeroFrames;
  layers?: HeroLayer[];
  glaze?: { src?: string }; // optional overlay; procedural shader if absent
  focal?: [number, number]; // 0..1 focal point for responsive crops
}

/**
 * Neutral placeholder manifest used until the client drops real imagery.
 * Points at SVG placeholders generated under /public/hero/demo.
 */
export const PLACEHOLDER_MANIFEST: HeroManifest = {
  mode: "still",
  still: "/hero/demo/still.svg",
  layers: [
    { src: "/hero/demo/layer-bun-top.svg", depth: 1, label: "Pan brioche" },
    { src: "/hero/demo/layer-lettuce.svg", depth: 0.75, label: "Lechuga" },
    { src: "/hero/demo/layer-patty.svg", depth: 0.5, label: "Carne madurada" },
    { src: "/hero/demo/layer-cheese.svg", depth: 0.3, label: "Cheddar" },
    { src: "/hero/demo/layer-bun-bottom.svg", depth: 0, label: "Base" },
  ],
  focal: [0.5, 0.45],
};

/** Resolve the manifest used by an experience. Real CMS wiring lands in A-DATA. */
export function resolveHeroManifest(
  override?: Partial<HeroManifest>,
): HeroManifest {
  if (!override) return PLACEHOLDER_MANIFEST;
  return { ...PLACEHOLDER_MANIFEST, ...override };
}

export function framePath(frames: HeroFrames, index: number): string {
  const n = String(index + 1).padStart(frames.pad, "0");
  return `${frames.dir}/${n}.${frames.ext}`;
}
