"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { emberEase, prefersReducedMotion } from "./motion";

/**
 * Count-up that runs once on enter view, weighty ease. Writes textContent
 * imperatively (no per-frame re-render). Tabular figures for a clean tick.
 */
export function Counter({
  to,
  suffix = "",
  durationMs = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = Math.round(emberEase(t) * to);
      el.textContent = `${v}${suffix}`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, suffix, durationMs]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      0{suffix}
    </span>
  );
}
