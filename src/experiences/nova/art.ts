// NOVA — art direction constants + procedural backdrop styles. Framework-free
// so both DOM (lite tier) and the canvas wrapper can share the exact gradients.

import { NOVA_COLORS } from "./theme";

/**
 * Volumetric aurora backdrop, pure CSS. Always rendered (even on the lite tier
 * where no canvas mounts) so the page never looks flat. Layered radial cones in
 * the brand's solar/plasma colors over the deep-space bg, finished with a soft
 * vignette so the frame has weight and the center reads as the focal plane.
 */
export const AURORA_BACKDROP: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background: [
    // Solar bloom, upper-left.
    `radial-gradient(60% 50% at 22% 18%, ${hexA(NOVA_COLORS.accent, 0.24)} 0%, transparent 60%)`,
    // Plasma counter-glow, lower-right.
    `radial-gradient(55% 45% at 82% 78%, ${hexA(NOVA_COLORS.accent2, 0.22)} 0%, transparent 62%)`,
    // High halo seeding the hero.
    `radial-gradient(120% 90% at 50% 0%, ${hexA(NOVA_COLORS.glaze, 0.09)} 0%, transparent 55%)`,
    // Deep vignette pulling the edges into the void (frame weight).
    `radial-gradient(140% 120% at 50% 42%, transparent 52%, ${hexA(NOVA_COLORS.bg, 0.55)} 100%)`,
    NOVA_COLORS.bg,
  ].join(","),
};

/**
 * Animated aurora drift layer — a second, slowly rotating set of cones that
 * breathes the backdrop so it never looks like a frozen gradient. Pair the
 * returned style with the `nova-aurora-drift` keyframes injected at runtime.
 */
export const AURORA_DRIFT: React.CSSProperties = {
  position: "fixed",
  inset: "-25%",
  zIndex: 0,
  pointerEvents: "none",
  opacity: 0.55,
  mixBlendMode: "screen",
  willChange: "transform",
  animation: "nova-aurora-drift 38s ease-in-out infinite alternate",
  background: [
    `radial-gradient(40% 38% at 30% 70%, ${hexA(NOVA_COLORS.accent2, 0.16)} 0%, transparent 60%)`,
    `radial-gradient(46% 40% at 72% 30%, ${hexA(NOVA_COLORS.accent, 0.14)} 0%, transparent 62%)`,
  ].join(","),
};

/** Tiny tiling fractal-noise SVG → data URI for the grain layer. */
const NOISE_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>` +
      `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
      `<feColorMatrix type='saturate' values='0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/></svg>`,
  );

/**
 * Film grain — a fixed, additive monochrome noise tile over everything. Keeps
 * the deep blacks alive and unifies DOM + canvas under one texture (SOTD
 * "atmosphere"). Tiny, GPU-cheap, and SSR-safe (inline SVG data URI).
 */
export const FILM_GRAIN: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  pointerEvents: "none",
  opacity: 0.05,
  mixBlendMode: "overlay",
  backgroundImage: `url("${NOISE_URI}")`,
  backgroundSize: "180px 180px",
  willChange: "transform",
  animation: "nova-grain-shift 0.8s steps(3) infinite",
};

/** A drifting volumetric "god-ray" cone for the hero, CSS conic + blur. */
export const VOLUMETRIC_CONE: React.CSSProperties = {
  position: "absolute",
  inset: "-20%",
  zIndex: 0,
  pointerEvents: "none",
  background: `conic-gradient(from 210deg at 50% -10%, transparent 0deg, ${hexA(
    NOVA_COLORS.glaze,
    0.16,
  )} 18deg, transparent 40deg)`,
  filter: "blur(28px)",
  mixBlendMode: "screen",
  willChange: "transform, opacity",
};

/**
 * Keyframes the NOVA layers reference. Injected once at runtime (see index.tsx)
 * because the experience must not touch the root globals.css. Idempotent.
 */
export const NOVA_KEYFRAMES = `
@keyframes nova-aurora-drift {
  0%   { transform: rotate(0deg)   scale(1)    translate3d(0, 0, 0); }
  100% { transform: rotate(8deg)   scale(1.12) translate3d(2%, -3%, 0); }
}
@keyframes nova-grain-shift {
  0%   { transform: translate3d(0, 0, 0); }
  33%  { transform: translate3d(-2%, 1%, 0); }
  66%  { transform: translate3d(1%, -2%, 0); }
  100% { transform: translate3d(2%, 1%, 0); }
}
@keyframes nova-hint-glide {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50%      { transform: translateY(4px); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .nova-anim { animation: none !important; }
}
`;

/** Append an alpha to a #rrggbb hex → rgba() string. */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Hero still image source (photorealistic; never CGI food). */
export const HERO_STILL = "/hero/demo/still.svg";
