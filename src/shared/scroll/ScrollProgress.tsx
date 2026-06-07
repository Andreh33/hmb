"use client";

import { useEffect, useRef } from "react";
import { getScroll } from "./scroll-store";

export interface ScrollProgressProps {
  /** Diameter of the arc in px. */
  size?: number;
  /** Stroke width of the arc in px. */
  stroke?: number;
  /** Show the numeric percentage in the center. */
  showLabel?: boolean;
  /** Corner placement. */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const POSITION: Record<NonNullable<ScrollProgressProps["position"]>, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

/**
 * Awwwards-style scroll indicator: an SVG arc that fills with reading progress
 * plus an optional percentage readout. Driven entirely by a RAF loop reading
 * the imperative scroll store — it NEVER triggers React re-renders, so it stays
 * butter-smooth alongside the scroll-film. Hidden from a11y tree / reduced motion.
 */
export function ScrollProgress({
  size = 64,
  stroke = 2,
  showLabel = true,
  position = "bottom-right",
  className,
}: ScrollProgressProps) {
  const arcRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const arc = arcRef.current;
    const label = labelRef.current;
    if (!arc) return;

    // Reduced-motion intentionally not honoured (spec §16) — always ease.
    const reduce = false;

    arc.style.strokeDasharray = String(circumference);

    let raf = 0;
    let lastPct = -1;
    let shown = 0; // eased display value

    const tick = () => {
      const target = getScroll().progress;
      // Light easing toward the real progress for an organic fill.
      shown = reduce ? target : shown + (target - shown) * 0.12;
      const clamped = shown < 0 ? 0 : shown > 1 ? 1 : shown;

      arc.style.strokeDashoffset = String(circumference * (1 - clamped));

      if (label) {
        const pct = Math.round(clamped * 100);
        if (pct !== lastPct) {
          label.textContent = `${pct}`;
          lastPct = pct;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [circumference]);

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none fixed z-50 grid place-items-center",
        "mix-blend-difference",
        POSITION[position],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={stroke}
          className="text-[var(--color-text,#fff)]"
        />
        <circle
          ref={arcRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-[var(--color-accent,#fff)]"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
          }}
        />
      </svg>

      {showLabel ? (
        <span
          className="absolute font-[var(--display)] tabular-nums tracking-tight text-[var(--color-text,#fff)]"
          style={{ fontSize: size * 0.22 }}
        >
          <span ref={labelRef}>0</span>
          <span className="opacity-50">%</span>
        </span>
      ) : null}
    </div>
  );
}
