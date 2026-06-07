"use client";

// SEAR — Capability tier strategy (§16).
// Maps raw Capabilities into one of three named tiers and a set of feature
// flags. Every experience reads these flags to degrade gracefully — the goal is
// that the SAME layout renders on every device, just with fewer GPU effects.
// A broken/blank screen is never an acceptable outcome.

import { useMemo } from "react";
import type { Capabilities } from "./capabilities";
import { SSR_CAPABILITIES } from "./capabilities";

/**
 * full  — desktop with WebGL2/WebGPU, plenty of RAM/cores: every effect on.
 * medio — capable but constrained (mid mobile, Safari, low RAM): effects dimmed.
 * lite  — weak/old device or no WebGL at all: DOM-only, no <Canvas> mounted.
 */
export type Tier = "full" | "medio" | "lite";

export interface TierFlags {
  tier: Tier;
  /** Mount ambient particle fields (ParticleField / ImageParticles). */
  particles: boolean;
  /** Run the matter/fluid simulation (FluidSim) — heaviest GPU+CPU cost. */
  fluid: boolean;
  /** Enable the post-processing stack (PostFX: bloom, chroma, grain). */
  postfx: boolean;
  /** Mount any three/R3F <Canvas> at all. False ⇒ pure DOM hero/sections. */
  canvas3d: boolean;
  /** Hard cap for particle counts; pass to ParticleField `count`. */
  maxParticles: number;
  /** Suggested max devicePixelRatio for <Canvas dpr>. Caps fill-rate cost. */
  maxDpr: number;
  /** Bloom intensity multiplier (0..1) to soften effects on weaker GPUs. */
  fxScale: number;
}

/**
 * Pure mapping from capabilities → tier flags. Exported separately so it can be
 * unit-tested and reused on the server without React.
 */
export function computeTier(caps: Capabilities): TierFlags {
  // No usable WebGL (or pre-hydration SSR): the only safe answer is DOM-only.
  if (!caps.webgl) {
    return {
      tier: "lite",
      particles: false,
      fluid: false,
      postfx: false,
      canvas3d: false,
      maxParticles: 0,
      maxDpr: 1,
      fxScale: 0,
    };
  }

  const lowMemory = caps.deviceMemory > 0 && caps.deviceMemory <= 4;
  const lowCores = caps.hardwareConcurrency <= 4;
  const weak = lowMemory || (caps.mobile && lowCores);

  // LITE — constrained mobile, low RAM, or no WebGL2. Keep a single light
  // canvas possible but strip the expensive simulations and post stack.
  if (weak || !caps.webgl2) {
    return {
      tier: "lite",
      particles: false,
      fluid: false,
      postfx: false,
      // Allow a minimal canvas only if the GPU can take it (mid mobile);
      // truly low-RAM devices stay DOM-only.
      canvas3d: caps.webgl2 && !lowMemory,
      maxParticles: 0,
      maxDpr: 1,
      fxScale: 0,
    };
  }

  // MEDIO — capable mobile, Safari, or modest desktop. Effects on but dialed
  // back: fewer particles, no fluid sim, lighter post, capped DPR.
  const medio = caps.mobile || caps.safari || lowCores || caps.deviceMemory < 8;
  if (medio) {
    return {
      tier: "medio",
      particles: true,
      fluid: false,
      postfx: true,
      canvas3d: true,
      maxParticles: caps.mobile ? 400 : 900,
      maxDpr: Math.min(caps.dpr, 1.5),
      fxScale: 0.6,
    };
  }

  // FULL — strong desktop GPU (WebGL2/WebGPU), 8GB+, many cores.
  return {
    tier: "full",
    particles: true,
    fluid: true,
    postfx: true,
    canvas3d: true,
    maxParticles: caps.webgpu ? 4000 : 2500,
    maxDpr: Math.min(caps.dpr, 2),
    fxScale: 1,
  };
}

/** Tier derived from the SSR-safe baseline. Used as the first-paint default. */
export const SSR_TIER: TierFlags = computeTier(SSR_CAPABILITIES);

/**
 * Hook form: memoizes computeTier over the capabilities it is given. Most code
 * should use `useTier()` from Capability.tsx (which supplies the live caps via
 * context); this lower-level hook exists for tests and ad-hoc usage.
 */
export function useTierFrom(caps: Capabilities): TierFlags {
  return useMemo(() => computeTier(caps), [caps]);
}
