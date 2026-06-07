// NOVA — pure motion math for the layered scroll-camera. No React, no Three.
// Kept framework-free so it's trivially testable and reusable by the scene.

/** Clamp to [0,1]. */
export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** smoothstep — eased 0→1 ramp. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/** smootherstep — Ken Perlin's C2 ramp; zero accel at both ends (more "weight"). */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Map a global progress p (0..1) onto a sub-range, eased. */
export function band(p: number, start: number, end: number): number {
  return smoothstep(start, end, p);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate-independent exponential smoothing toward a target. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * The NOVA scroll-camera path. Given global progress (0..1) it returns the
 * camera dolly (z), the cloud rotation, a parallax offset and a "burst" energy
 * spike used to scatter particles between stations.
 *
 * Five stations spread across the page. Between each, energy spikes (the burst)
 * so the photo disintegrates and recomposes as a different focus. Easing is
 * smootherstep so the dolly accelerates and settles with weight rather than
 * gliding linearly — the camera feels like it has mass.
 */
export interface CameraState {
  /** Camera Z dolly (closer at the hero, pulls back through the journey). */
  z: number;
  /** Cloud Y rotation in radians — a slow continuous orbit. */
  rotY: number;
  rotX: number;
  /** Vertical parallax of the whole cloud. */
  panY: number;
  /** 0 = composed photo, 1 = fully dispersed. Spikes between stations. */
  burst: number;
  /** Lateral sway, breathes the rig so it never sits perfectly still. */
  panX: number;
}

const STATION_COUNT = 5;

export function cameraFor(progress: number, time: number): CameraState {
  const p = clamp01(progress);
  // Dolly: start tight on the hero (z≈4.2), drift back to reveal the field.
  // Smootherstep gives the pull-back real weight — slow to leave, slow to land.
  const z = lerp(4.2, 6.6, smootherstep(0, 1, p));
  // Continuous slow orbit + scroll-coupled twist (kinetic, never static). A
  // gentle eased component keeps early scroll subtle then opens up mid-journey.
  const rotY = time * 0.055 + smootherstep(0, 1, p) * Math.PI * 0.95;
  // A breathing tilt that peaks mid-page; layered micro-oscillation for life.
  const rotX = Math.sin(p * Math.PI) * 0.14 + Math.sin(time * 0.23) * 0.012;
  const panY = (0.5 - p) * 0.85 + Math.sin(time * 0.19) * 0.03;
  const panX = Math.sin(time * 0.15) * 0.06;

  // Burst energy: a sharp spike centered between each pair of stations. Raising
  // the sine to a power tightens the pulse so the cloud holds its composed
  // photo near each station and only detonates in the gaps (more deliberate).
  const seg = p * (STATION_COUNT - 1);
  const frac = seg - Math.floor(seg);
  const bell = Math.sin(frac * Math.PI);
  const burst = bell * bell; // sharper, weightier transition

  return { z, rotY, rotX, panY, burst, panX };
}
