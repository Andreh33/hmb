"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Observer);
}

export interface PinScrubOptions {
  /** Element that gets pinned (defaults to `trigger`). */
  pinEl?: gsap.DOMTarget;
  /** Scroll distance the act stays pinned. Number = px, string = ST syntax. */
  distance?: number | string;
  /** Scrub smoothing in seconds, or `true` for instant. */
  scrub?: number | boolean;
  start?: string;
  /** Fired with normalized 0..1 progress on every scroll frame. */
  onProgress?: (p: number) => void;
  /** Fired when the act becomes active (enter or enter-back). */
  onActivate?: () => void;
  markers?: boolean;
}

/**
 * Creates a pinned, scrubbed timeline for one act. The returned timeline is
 * empty — callers populate it (build()) and it scrubs against scroll while the
 * trigger stays pinned. Returns null on the server.
 */
export function createPinScrub(
  trigger: gsap.DOMTarget,
  opts: PinScrubOptions = {},
): gsap.core.Timeline | null {
  if (typeof window === "undefined") return null;

  const {
    pinEl,
    distance = "+=120%",
    scrub = true,
    start = "top top",
    onProgress,
    onActivate,
    markers = false,
  } = opts;

  const end =
    typeof distance === "number" ? `+=${distance}` : distance;

  return gsap.timeline({
    scrollTrigger: {
      trigger,
      pin: pinEl ?? trigger,
      start,
      end,
      scrub,
      anticipatePin: 1,
      markers,
      onEnter: onActivate,
      onEnterBack: onActivate,
      onUpdate: onProgress
        ? (self) => onProgress(self.progress)
        : undefined,
    },
  });
}

export interface HorizontalTrackOptions {
  /** Inner track that translates on X (defaults to first child of trigger). */
  track?: HTMLElement | null;
  /** Total horizontal distance in px; auto-measured if omitted. */
  distance?: number;
  scrub?: number | boolean;
  /** Fired with normalized 0..1 progress on every frame. */
  onProgress?: (p: number) => void;
  onActivate?: () => void;
}

/**
 * Pins a section and translates an inner track horizontally as you scroll
 * vertically — the classic "tramo horizontal". Distance is measured from the
 * track's scrollWidth so it always lands flush. Returns a cleanup fn or null.
 */
export function createHorizontalTrack(
  trigger: HTMLElement,
  opts: HorizontalTrackOptions = {},
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const track =
    opts.track ?? (trigger.firstElementChild as HTMLElement | null);
  if (!track) return null;

  const measure = () =>
    opts.distance ?? Math.max(0, track.scrollWidth - trigger.offsetWidth);

  const tween = gsap.to(track, {
    x: () => -measure(),
    ease: "none",
    scrollTrigger: {
      trigger,
      pin: true,
      scrub: opts.scrub ?? 1,
      start: "top top",
      end: () => `+=${measure()}`,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onEnter: opts.onActivate,
      onEnterBack: opts.onActivate,
      onUpdate: opts.onProgress
        ? (self) => opts.onProgress?.(self.progress)
        : undefined,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

export interface DiscreteObserverOptions {
  /** Number of discrete panels/steps to advance through. */
  steps: number;
  /** Called with the new index (clamped 0..steps-1) on each advance. */
  onStep: (index: number, direction: 1 | -1) => void;
  /** Lock wheel/touch while a transition animates. */
  tolerance?: number;
  wheelSpeed?: number;
}

/**
 * Observer-driven discrete navigation for snap-style horizontal acts: each
 * wheel/swipe/key advance moves exactly one panel instead of free scrubbing.
 * Pairs with a paused timeline the caller scrubs in `onStep`.
 * Returns a disable() cleanup or null on server.
 */
export function createDiscreteObserver(
  target: gsap.DOMTarget,
  opts: DiscreteObserverOptions,
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const { steps, onStep, tolerance = 10, wheelSpeed = -1 } = opts;
  let index = 0;
  let animating = false;

  const go = (direction: 1 | -1) => {
    if (animating) return;
    const next = Math.min(Math.max(index + direction, 0), steps - 1);
    if (next === index) return;
    index = next;
    animating = true;
    onStep(index, direction);
    // Release the lock on the next tick; callers may extend via their tween.
    gsap.delayedCall(0.05, () => {
      animating = false;
    });
  };

  const observer = Observer.create({
    target,
    type: "wheel,touch,pointer",
    wheelSpeed,
    tolerance,
    preventDefault: true,
    onUp: () => go(1),
    onDown: () => go(-1),
    onLeft: () => go(1),
    onRight: () => go(-1),
  });

  return () => observer.kill();
}

export { ScrollTrigger, Observer };
