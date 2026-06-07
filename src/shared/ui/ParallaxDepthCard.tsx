"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

export interface DepthLayer {
  /** -1..1 — negative recedes, positive pops toward viewer. */
  depth: number;
  content: ReactNode;
  className?: string;
}

/**
 * Stacks layers that translate at depth-scaled offsets as the pointer moves,
 * producing diorama parallax. Each layer is positioned absolutely; pass the
 * base/back layer first.
 */
export function ParallaxDepthCard({
  layers,
  className = "",
  range = 24,
}: {
  layers: DepthLayer[];
  className?: string;
  range?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 200, damping: 22 });
  const sy = useSpring(py, { stiffness: 200, damping: 22 });

  function move(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] ${className}`}
    >
      {layers.map((l, i) => (
        <Layer key={i} sx={sx} sy={sy} layer={l} range={reduce ? 0 : range} />
      ))}
    </div>
  );
}

function Layer({
  sx,
  sy,
  layer,
  range,
}: {
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  layer: DepthLayer;
  range: number;
}) {
  const x = useTransform(sx, (v) => v * range * layer.depth);
  const y = useTransform(sy, (v) => v * range * layer.depth);
  return (
    <motion.div style={{ x, y }} className={layer.className}>
      {layer.content}
    </motion.div>
  );
}
