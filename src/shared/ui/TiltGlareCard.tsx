"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

/**
 * 3D tilt toward the pointer with a tracking specular glare sheet. Spring-
 * smoothed for 60fps; flattens entirely under reduced-motion. The glare
 * position is mutated imperatively (CSS vars) so it never re-renders React.
 */
export function TiltGlareCard({
  children,
  className = "",
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLSpanElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 280, damping: 24 });
  const sy = useSpring(py, { stiffness: 280, damping: 24 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  function move(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);
    const g = glare.current;
    if (g) {
      g.style.setProperty("--gx", `${nx * 100}%`);
      g.style.setProperty("--gy", `${ny * 100}%`);
      g.style.opacity = "1";
    }
  }
  function reset() {
    px.set(0.5);
    py.set(0.5);
    if (glare.current) glare.current.style.opacity = "0";
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 800,
      }}
      className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] ${className}`}
    >
      {children}
      {!reduce && (
        <span
          ref={glare}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at var(--gx,50%) var(--gy,50%), color-mix(in srgb, var(--color-text) 22%, transparent), transparent 55%)",
          }}
        />
      )}
    </motion.div>
  );
}
