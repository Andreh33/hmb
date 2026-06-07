"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "@/shared/motion/timings";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * Oversized editorial section heading with a per-line clip-up reveal and an
 * optional kicker label. Honors the experience's display font + motion feel.
 */
export function GiantSectionTitle({
  children,
  kicker,
  as: Tag = "h2",
  className = "",
}: {
  children: string;
  kicker?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shown = inView || reduce;
  const words = children.split(" ");

  return (
    <div ref={ref} className={className}>
      {kicker && (
        <motion.p
          className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--color-accent)]"
          initial={{ opacity: 0 }}
          animate={shown ? { opacity: 1 } : undefined}
          transition={{ duration: f.duration }}
        >
          {kicker}
        </motion.p>
      )}
      <Tag className="font-display text-5xl leading-[0.92] sm:text-7xl md:text-[clamp(3rem,9vw,8rem)]">
        <span className="sr-only">{children}</span>
        <span aria-hidden className="flex flex-wrap gap-x-[0.25em]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden py-[0.06em]">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={shown ? { y: "0%" } : undefined}
                transition={{
                  duration: f.duration,
                  ease: EASE_ARR[f.ease],
                  delay: i * f.stagger,
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </span>
      </Tag>
    </div>
  );
}
