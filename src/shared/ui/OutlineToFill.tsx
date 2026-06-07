"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Giant display text rendered as a hollow stroked outline that floods with the
 * accent fill on scroll-in (or hover). Built with text background-clip + a
 * masked overlay so the fill rises from the baseline.
 */
export function OutlineToFill({
  text,
  className = "",
  trigger = "scroll",
}: {
  text: string;
  className?: string;
  trigger?: "scroll" | "hover";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const filled = trigger === "scroll" ? inView || reduce : false;

  return (
    <span
      ref={ref}
      className={`group relative inline-block max-w-full whitespace-normal align-top font-display leading-none [overflow-wrap:anywhere] ${className}`}
      aria-label={text}
    >
      {/* Outline base */}
      <span
        aria-hidden
        className="block"
        style={{
          WebkitTextStroke: "1.5px var(--color-accent)",
          color: "transparent",
        }}
      >
        {text}
      </span>
      {/* Filling overlay, clipped from bottom */}
      <motion.span
        aria-hidden
        className={`pointer-events-none absolute inset-0 text-[var(--color-accent)] ${trigger === "hover" ? "[clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-within:[clip-path:inset(0_0_0_0)]" : ""}`}
        initial={trigger === "scroll" ? { clipPath: "inset(100% 0 0 0)" } : false}
        animate={
          trigger === "scroll"
            ? { clipPath: filled ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }
            : undefined
        }
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}
