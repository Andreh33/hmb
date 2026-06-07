"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useScroll } from "@/shared/scroll/scroll-store";

/**
 * A thin top-edge progress bar (or radial dot) driven by the shared scroll
 * store. Updates a CSS transform imperatively in RAF — zero React re-renders.
 */
export function ScrollProgress({
  variant = "bar",
  className = "",
}: {
  variant?: "bar" | "ring";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const C = 2 * Math.PI * 16;
    const loop = () => {
      const p = Math.min(Math.max(useScroll.getState().progress, 0), 1);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (ringRef.current)
        ringRef.current.style.strokeDashoffset = String(C * (1 - p));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (variant === "ring") {
    const C = 2 * Math.PI * 16;
    return (
      <svg
        className={className}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        role="progressbar"
        aria-label="Scroll progress"
      >
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-muted)" strokeOpacity="0.2" strokeWidth="3" />
        <circle
          ref={ringRef}
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 20 20)"
        />
      </svg>
    );
  }

  return (
    <div
      className={`pointer-events-none h-[3px] w-full overflow-hidden bg-[var(--color-muted)]/15 ${className}`}
      role="progressbar"
      aria-label="Scroll progress"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-[var(--color-accent)]"
        style={{ transform: "scaleX(0)", willChange: "transform", transition: reduce ? "none" : undefined }}
      />
    </div>
  );
}
