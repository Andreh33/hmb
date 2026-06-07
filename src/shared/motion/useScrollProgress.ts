"use client";

import { useEffect, useRef, useState } from "react";
import { getScroll, useScroll } from "@/shared/scroll/scroll-store";

export interface ScrollProgress {
  /** 0..1 over the whole page. */
  progress: number;
  /** Signed scroll velocity, smoothed by the Lenis driver. */
  velocity: number;
  /** Sign of the current velocity (-1 up, 0 idle, 1 down). */
  direction: -1 | 0 | 1;
}

const EMPTY: ScrollProgress = { progress: 0, velocity: 0, direction: 0 };

/**
 * Subscribes to the global scroll store (fed by Lenis in SmoothScroll) and
 * exposes a throttled, render-friendly snapshot of progress/velocity/direction.
 *
 * The store updates on every Lenis frame; re-rendering React that often is
 * wasteful, so this hook reads imperatively via getScroll() inside a single
 * RAF loop and only calls setState when the value crosses `epsilon` since the
 * last committed frame (or after `throttleMs`).
 *
 * For RAF-driven canvas/shader work that must NEVER re-render, read getScroll()
 * directly instead of using this hook.
 */
export function useScrollProgress(options?: {
  /** Minimum progress delta (0..1) required to commit a re-render. */
  epsilon?: number;
  /** Minimum ms between committed re-renders. */
  throttleMs?: number;
}): ScrollProgress {
  const epsilon = options?.epsilon ?? 0.002;
  const throttleMs = options?.throttleMs ?? 1000 / 30;

  const [snapshot, setSnapshot] = useState<ScrollProgress>(EMPTY);
  const lastProgress = useRef(0);
  const lastCommit = useRef(0);

  useEffect(() => {
    let raf = 0;
    let mounted = true;

    const tick = (t: number) => {
      if (!mounted) return;
      const { progress, velocity } = getScroll();
      const movedEnough = Math.abs(progress - lastProgress.current) >= epsilon;
      const timedOut = t - lastCommit.current >= throttleMs;
      // Commit when meaningfully moved, throttled; also flush a final frame
      // when velocity settles so the UI lands on an exact resting value.
      const settled = velocity === 0 && progress !== lastProgress.current;
      if ((movedEnough && timedOut) || settled) {
        lastProgress.current = progress;
        lastCommit.current = t;
        const direction: -1 | 0 | 1 =
          velocity > 0 ? 1 : velocity < 0 ? -1 : 0;
        setSnapshot({ progress, velocity, direction });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [epsilon, throttleMs]);

  return snapshot;
}

/**
 * Thin reactive selector over the scroll store for components that only need
 * progress and are fine re-rendering at the store's cadence (cheap consumers).
 */
export function useScrollProgressRaw(): number {
  return useScroll((s) => s.progress);
}
