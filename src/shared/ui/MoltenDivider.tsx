"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A horizontal divider rendered as a slowly undulating "molten" wave (animated
 * SVG path) in the accent gradient — a premium section separator. Reduced-
 * motion freezes the wave. Lightweight: one rAF mutating a path `d`.
 */
export function MoltenDivider({
  height = 48,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const W = 1200;
    const build = (t: number) => {
      const a1 = Math.sin(t) * 6;
      const a2 = Math.cos(t * 1.3) * 8;
      const mid = height / 2;
      return `M0,${mid} C${W * 0.25},${mid + a1} ${W * 0.5},${mid - a2} ${W * 0.75},${mid + a1} S${W},${mid - a2} ${W},${mid} L${W},${height} L0,${height} Z`;
    };
    if (reduce) {
      path.current?.setAttribute("d", build(0));
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      path.current?.setAttribute("d", build(now / 900));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, height]);

  return (
    <div className={`w-full ${className}`} aria-hidden>
      <svg
        viewBox={`0 0 1200 ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="block"
      >
        <defs>
          <linearGradient id="molten-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent2)" />
            <stop offset="50%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-glaze)" />
          </linearGradient>
        </defs>
        <path ref={path} fill="url(#molten-grad)" />
      </svg>
    </div>
  );
}
