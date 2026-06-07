"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useScroll } from "@/shared/scroll/scroll-store";

/**
 * An infinite horizontal marquee whose speed and direction react to scroll
 * velocity (read imperatively from the scroll store — no re-renders). Pauses
 * cleanly under reduced-motion.
 */
export function KineticMarquee({
  children,
  baseSpeed = 40,
  className = "",
  separator = "✦",
  reverse = false,
}: {
  children: ReactNode;
  /** px/sec at rest. */
  baseSpeed?: number;
  className?: string;
  separator?: ReactNode;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const dir = reverse ? -1 : 1;

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const vel = useScroll.getState().velocity;
      const speed = baseSpeed + Math.min(Math.abs(vel) * 600, 600);
      offset.current -= dir * speed * dt;
      const el = track.current;
      if (el) {
        const half = el.scrollWidth / 2 || 1;
        if (offset.current <= -half) offset.current += half;
        if (offset.current > 0) offset.current -= half;
        el.style.transform = `translate3d(${offset.current}px,0,0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduce, baseSpeed, dir]);

  const unit = (
    <span className="flex items-center gap-8 pr-8">
      {children}
      <span aria-hidden className="text-[var(--color-accent)]">
        {separator}
      </span>
    </span>
  );

  return (
    <div
      className={`relative overflow-hidden whitespace-nowrap ${className}`}
      aria-hidden
    >
      <div ref={track} className="flex w-max will-change-transform">
        {unit}
        {unit}
        {unit}
        {unit}
      </div>
    </div>
  );
}
