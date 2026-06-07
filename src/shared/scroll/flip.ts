"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

/**
 * GSAP-native equivalent of the shared `EASE.lux` cubic-bezier
 * (cubic-bezier(0.16,1,0.3,1)) — a slow, expensive-feeling settle. Kept as a
 * native ease string so we don't pull in the CustomEase plugin.
 */
const LUX_EASE = "power4.out";

export interface MorphOptions {
  /** Easing curve (defaults to the shared cinematic ease). */
  ease?: string;
  /** Tween duration in seconds. */
  duration?: number;
  /** Animate scale alongside position (default true). */
  scale?: boolean;
  /** Fade/absorb non-matching children for a smoother absorb. */
  absorb?: boolean;
  /** Called once the morph completes. */
  onComplete?: () => void;
}

/**
 * Shared-element morph (FLIP) — captures the current geometry of `el`, runs
 * `mutate` to relocate/restyle it (e.g. moving the hero patty node into the
 * first menu card), then tweens from the old box to the new one.
 *
 * Returns the live Flip tween so callers can attach it to a ScrollTrigger or
 * kill it on unmount. No-ops on the server.
 */
export function morphShared(
  el: Element | Element[] | string,
  mutate: () => void,
  opts: MorphOptions = {},
): gsap.core.Timeline | null {
  if (typeof window === "undefined") return null;

  const {
    ease = LUX_EASE,
    duration = 0.9,
    scale = true,
    absorb = true,
    onComplete,
  } = opts;

  const state = Flip.getState(el, {
    props: "borderRadius,opacity,filter",
    simple: true,
  });

  mutate();

  return Flip.from(state, {
    duration,
    ease,
    scale,
    absorb,
    nested: true,
    onComplete,
  });
}

/**
 * Drives a shared-element morph from a normalized progress value (0..1) instead
 * of time — ideal for scrubbing a hero → first-card morph against scroll.
 *
 * Build it once (geometry captured + mutated), then call `seek(progress)` from
 * a ScrollTrigger `onUpdate` / RAF loop. The returned timeline is paused.
 */
export function scrubMorph(
  el: Element | Element[] | string,
  mutate: () => void,
  opts: Omit<MorphOptions, "onComplete"> = {},
): { tl: gsap.core.Timeline | null; seek: (p: number) => void } {
  const tl =
    typeof window === "undefined"
      ? null
      : morphShared(el, mutate, opts);

  if (tl) tl.pause(0);

  const seek = (p: number) => {
    if (!tl) return;
    const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
    tl.progress(clamped);
  };

  return { tl, seek };
}

/** Re-export for callers that want the raw plugin (already registered). */
export { Flip };
