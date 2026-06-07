"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "@/shared/motion/timings";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * Odometer-style number that rolls each digit column from 0 to the target on
 * scroll-in. Good for prices/stats. Pass prefix/suffix (e.g. "€", "+").
 */
export function NumberRoll({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const play = inView;

  const str = value.toFixed(decimals);
  const label = `${prefix}${str}${suffix}`;

  return (
    <span ref={ref} className={`inline-flex tabular-nums ${className}`} aria-label={label}>
      <span aria-hidden>{prefix}</span>
      {Array.from(str).map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit
            key={i}
            target={Number(ch)}
            play={play && !reduce}
            duration={f.duration}
            delay={i * (f.stagger * 0.8)}
            easeIdx={f.ease}
          />
        ) : (
          <span aria-hidden key={i}>
            {ch}
          </span>
        ),
      )}
      <span aria-hidden>{suffix}</span>
    </span>
  );
}

function Digit({
  target,
  play,
  duration,
  delay,
  easeIdx,
}: {
  target: number;
  play: boolean;
  duration: number;
  delay: number;
  easeIdx: keyof typeof EASE_ARR;
}) {
  return (
    <span
      aria-hidden
      className="relative inline-block overflow-hidden"
      style={{ height: "1em", width: "0.62ch" }}
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={{ y: 0 }}
        animate={{ y: play ? `-${target}em` : 0 }}
        transition={{ duration: duration * 1.4, ease: EASE_ARR[easeIdx], delay }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} style={{ height: "1em", lineHeight: "1em" }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
