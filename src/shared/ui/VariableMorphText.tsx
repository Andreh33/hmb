"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Animates the variable-font weight (and optional slant) across the headline on
 * hover, rippling per-character for a "breathing type" effect. Falls back to a
 * static heavy weight when motion is reduced.
 */
export function VariableMorphText({
  text,
  className = "",
  minWeight = 300,
  maxWeight = 800,
}: {
  text: string;
  className?: string;
  minWeight?: number;
  maxWeight?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  function move(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = e.clientX - r.left;
    el.querySelectorAll<HTMLElement>("[data-ch]").forEach((node) => {
      const nr = node.getBoundingClientRect();
      const center = nr.left - r.left + nr.width / 2;
      const d = Math.abs(center - cx);
      const t = Math.max(0, 1 - d / (r.width * 0.4));
      node.style.fontWeight = String(Math.round(minWeight + (maxWeight - minWeight) * t));
    });
  }
  function reset() {
    ref.current
      ?.querySelectorAll<HTMLElement>("[data-ch]")
      .forEach((n) => (n.style.fontWeight = String(minWeight)));
  }

  useEffect(() => {
    if (reduce) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`inline-flex font-display ${className}`}
      aria-label={text}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-ch
          aria-hidden
          style={{
            fontWeight: reduce ? maxWeight : minWeight,
            transition: "font-weight 0.25s ease, font-variation-settings 0.25s ease",
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
