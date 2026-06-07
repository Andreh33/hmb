// EMBER motion utilities — weighty, orchestrated. Pure helpers (SSR-safe).

import { EMBER_EASE } from "./theme";

/** Clamp to [0,1]. */
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Map x in [a,b] to [0,1], clamped. */
export function norm(x: number, a: number, b: number): number {
  if (b === a) return 0;
  return clamp01((x - a) / (b - a));
}

/** Smoothstep easing for hand-graded falloffs. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = norm(x, edge0, edge1);
  return t * t * (3 - 2 * t);
}

/** Cubic-bezier sampler matching EMBER_EASE (for canvas/RAF interpolation). */
export function emberEase(t: number): number {
  const [, p1y, , p2y] = EMBER_EASE;
  const u = clamp01(t);
  // De Casteljau on the y-curve with control points (p1y, p2y), x≈t approx.
  const mt = 1 - u;
  return (
    3 * mt * mt * u * p1y + 3 * mt * u * u * p2y + u * u * u
  );
}

/** lerp. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Stagger reveal order for hero headline letters (centre-out ignition). */
export function igniteOrder(length: number): number[] {
  const mid = (length - 1) / 2;
  return Array.from({ length }, (_, i) => Math.abs(i - mid));
}

/**
 * Exponential settle toward a target — frame-rate-aware critically-damped
 * follow for imperative RAF consumers (sparks, parallax stages). `lambda` is
 * the responsiveness (higher = snappier); `dt` in seconds. Gives motion real
 * "weight" instead of linear catch-up. SSR-safe (pure).
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Ease-in-out cubic — symmetric, used where exits must mirror entrances. */
export function easeInOut(t: number): number {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

/** SSR-safe read of the user's reduced-motion preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
