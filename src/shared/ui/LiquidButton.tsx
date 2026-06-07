"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * A gooey "liquid" fill that wells up from the pointer's entry point on hover,
 * then drains away on exit. Pure CSS/Motion, no SVG filter cost on idle.
 */
export function LiquidButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  function enter(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
    setHover(true);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerEnter={enter}
      onPointerLeave={() => setHover(false)}
      className={`relative isolate overflow-hidden rounded-[var(--radius)] border border-[var(--color-accent)] px-7 py-3.5 font-medium text-[var(--color-text)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${hover ? "text-[var(--color-bg)]" : ""} ${className}`}
    >
      <motion.span
        aria-hidden
        className="absolute -z-10 rounded-full bg-[var(--color-accent)]"
        style={{
          left: `${origin.x}%`,
          top: `${origin.y}%`,
          width: "260%",
          aspectRatio: "1",
          x: "-50%",
          y: "-50%",
        }}
        initial={false}
        animate={{ scale: reduce ? (hover ? 1 : 0) : hover ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: EASE_ARR.lux }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}
