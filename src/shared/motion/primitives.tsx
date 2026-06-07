"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useInView,
  type Variants,
  type HTMLMotionProps,
} from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "./timings";
import { EASE_ARR } from "./easings";

// Motion primitives parameterized by the active experience's motionFeel.

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: f.duration, ease: EASE_ARR[f.ease], delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: f.stagger } },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  y = 24,
  className,
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const item: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: f.spring
        ? { type: "spring", ...f.spring }
        : { duration: f.duration, ease: EASE_ARR[f.ease] },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

export function Magnetic({
  children,
  strength = 0.4,
  className,
  ...rest
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
} & HTMLMotionProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "translate(0px, 0px)";
      }}
      style={{ transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SplitText({
  text,
  className,
  charClassName,
}: {
  text: string;
  className?: string;
  charClassName?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className={charClassName}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: "0.4em" }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: f.duration * 0.7,
            ease: EASE_ARR[f.ease],
            delay: i * f.stagger,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
