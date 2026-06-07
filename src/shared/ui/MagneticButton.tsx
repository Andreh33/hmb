"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "@/shared/motion/timings";
import { EASE } from "@/shared/motion/easings";

/**
 * A button whose body magnetically tracks the pointer, with the inner label
 * trailing at a softer strength for parallax depth. Re-styled live by tokens.
 */
export function MagneticButton({
  children,
  strength = 0.45,
  className = "",
  onClick,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  function move(e: React.PointerEvent) {
    if (reduce) return;
    const el = wrap.current;
    const lbl = label.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
    if (lbl) lbl.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
  }
  function reset() {
    if (wrap.current) wrap.current.style.transform = "translate(0,0)";
    if (label.current) label.current.style.transform = "translate(0,0)";
  }

  return (
    <motion.div
      ref={wrap}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ transition: `transform ${f.duration}s ${EASE.lux}` }}
      whileTap={{ scale: 0.96 }}
      className="inline-block"
    >
      <button
        type="button"
        onClick={onClick}
        className={`sear-glow inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent)] px-7 py-3.5 font-medium text-[var(--color-bg)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${className}`}
      >
        <span
          ref={label}
          style={{ transition: `transform ${f.duration}s ${EASE.lux}` }}
          className="inline-block"
        >
          {children}
        </span>
      </button>
    </motion.div>
  );
}
