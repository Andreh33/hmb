"use client";

import { useEffect, useRef } from "react";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * Velocity-reactive skew. Attaches an imperative RAF that reads the shared
 * scroll store (no re-render) and writes a clamped skewX onto the element so
 * fast flicks lean the layout — the page TRANSFORMS while scrolling. Returns a
 * ref to spread onto any element.
 */
export function useVelocitySkew<T extends HTMLElement = HTMLDivElement>(
  factor = 0.35,
  max = 10,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    let raf = 0;
    let cur = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = ref.current;
      if (!el) return;
      const v = getScroll().velocity;
      const target = Math.max(-max, Math.min(max, v * factor));
      cur += (target - cur) * 0.18;
      el.style.transform = `skewX(${cur.toFixed(2)}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [factor, max]);
  return ref;
}
