"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  type Variants,
  type HTMLMotionProps,
} from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { getScroll } from "@/shared/scroll/scroll-store";
import { feelFor } from "./timings";
import { EASE, EASE_ARR } from "./easings";

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

// ---------------------------------------------------------------------------
// Scramble — decodes text from glyph noise into the final string. Speed and
// settle pacing track the active experience's motionFeel.
// ---------------------------------------------------------------------------

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$@/\\<>*+=";

export function Scramble({
  text,
  className,
  trigger = "inview",
  glyphs = SCRAMBLE_GLYPHS,
}: {
  text: string;
  className?: string;
  /** When to start decoding. */
  trigger?: "inview" | "mount" | "hover";
  glyphs?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [display, setDisplay] = useState(() =>
    trigger === "mount" ? text : "",
  );
  const frameRef = useRef<number>(0);

  const run = useCallback(() => {
    const chars = Array.from(text);
    // Faster feels resolve quicker; weighty/elegant linger on the decode.
    const totalFrames = Math.max(
      14,
      Math.round((f.spring ? 0.5 : f.duration) * 60),
    );
    let frame = 0;
    const pool = glyphs.length > 0 ? glyphs : SCRAMBLE_GLYPHS;

    const step = () => {
      const settle = (frame / totalFrames) * chars.length;
      const out = chars.map((ch, i) => {
        if (ch === " ") return " ";
        if (i < settle) return ch;
        const g = pool[Math.floor(Math.random() * pool.length)] ?? ch;
        return g;
      });
      setDisplay(out.join(""));
      frame += 1;
      if (frame <= totalFrames) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(step);
  }, [text, glyphs, f]);

  useEffect(() => {
    if (trigger === "mount") run();
    else if (trigger === "inview" && inView) run();
    return () => cancelAnimationFrame(frameRef.current);
  }, [trigger, inView, run]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      onPointerEnter={trigger === "hover" ? run : undefined}
      style={{ fontVariantLigatures: "none" }}
    >
      <span aria-hidden>{display || " "}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// VariableMorphText — animates variable-font axes (weight / width) driven by
// scroll progress or in-view state. Reads getScroll() in RAF for the scroll
// mode so it never re-renders on every frame.
// ---------------------------------------------------------------------------

export function VariableMorphText({
  children,
  className,
  driver = "inview",
  weight = [200, 800],
  width = [75, 125],
  style,
}: {
  children: ReactNode;
  className?: string;
  /** "scroll" maps page progress to the axes; "inview" morphs once on enter. */
  driver?: "scroll" | "inview";
  /** [from, to] font-weight. */
  weight?: [number, number];
  /** [from, to] font-stretch / 'wdth' axis as percentage. */
  width?: [number, number];
  style?: CSSProperties;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-30% 0px -30% 0px" });

  const [w0, w1] = weight;
  const [s0, s1] = width;

  // Scroll-driven mode: imperative RAF, zero React churn.
  useEffect(() => {
    if (driver !== "scroll") return;
    let raf = 0;
    const tick = () => {
      const p = getScroll().progress;
      const wght = w0 + (w1 - w0) * p;
      const wdth = s0 + (s1 - s0) * p;
      const el = ref.current;
      if (el) {
        el.style.fontVariationSettings = `"wght" ${wght.toFixed(1)}, "wdth" ${wdth.toFixed(1)}`;
        el.style.fontWeight = String(Math.round(wght));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [driver, w0, w1, s0, s1]);

  if (driver === "scroll") {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: "inline-block",
          fontVariationSettings: `"wght" ${w0}, "wdth" ${s0}`,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-block", ...style }}
      initial={{ fontVariationSettings: `"wght" ${w0}, "wdth" ${s0}` }}
      animate={
        inView
          ? { fontVariationSettings: `"wght" ${w1}, "wdth" ${s1}` }
          : { fontVariationSettings: `"wght" ${w0}, "wdth" ${s0}` }
      }
      transition={
        f.spring
          ? { type: "spring", ...f.spring }
          : { duration: f.duration, ease: EASE_ARR[f.ease] }
      }
    >
      {children}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Parallax — depth-based translate driven by global scroll. Reads getScroll()
// in RAF (no re-render). Depth < 1 moves slower (far), depth > 1 faster (near).
// ---------------------------------------------------------------------------

export function Parallax({
  children,
  depth = 0.2,
  axis = "y",
  className,
  style,
}: {
  children: ReactNode;
  /** Parallax strength. 0 = locked, 0.2 subtle, 1 = strong. Sign sets dir. */
  depth?: number;
  axis?: "x" | "y";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let current = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        // Offset relative to the element's own viewport position so each layer
        // parallaxes around its own center rather than the whole page.
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const rel = (rect.top + rect.height / 2 - vh / 2) / vh; // -1..1-ish
        // Read the shared scroll store; velocity adds a momentary lead so fast
        // flicks overshoot slightly before settling (kinetic depth).
        const { velocity } = getScroll();
        const target = -rel * depth * 100 - velocity * depth * 0.6;
        // Ease toward target for a smooth, weighty drift.
        current += (target - current) * 0.12;
        el.style.transform =
          axis === "y"
            ? `translate3d(0, ${current.toFixed(2)}px, 0)`
            : `translate3d(${current.toFixed(2)}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [depth, axis]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OutlineToFill — text rendered as a stroked outline that floods with fill on
// scroll into view. Timing/spring from motionFeel.
// ---------------------------------------------------------------------------

export function OutlineToFill({
  text,
  className,
  fillColor = "var(--accent)",
  strokeColor = "var(--text)",
  strokeWidth = 1,
  style,
}: {
  text: string;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      style={{
        display: "inline-block",
        position: "relative",
        maxWidth: "100%",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {/* Outline base layer */}
      <span
        aria-hidden
        style={{
          color: "transparent",
          WebkitTextStrokeWidth: `${strokeWidth}px`,
          WebkitTextStrokeColor: strokeColor,
        }}
      >
        {text}
      </span>
      {/* Fill layer, clipped from left as it enters view */}
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          color: fillColor,
          whiteSpace: "nowrap",
          overflow: "hidden",
          willChange: "clip-path",
        }}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={
          f.spring
            ? { type: "spring", ...f.spring }
            : { duration: f.duration * 1.2, ease: EASE_ARR[f.ease] }
        }
      >
        {text}
      </motion.span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// KineticMarquee — seamless looping marquee. Base speed + scroll-velocity skew
// give it kinetic life. Direction and easing flavor follow motionFeel.
// ---------------------------------------------------------------------------

export function KineticMarquee({
  children,
  className,
  speed = 60,
  direction = "left",
  velocityFactor = 0.6,
  gap = 48,
  repeat = 2,
}: {
  children: ReactNode;
  className?: string;
  /** Base px/second. */
  speed?: number;
  direction?: "left" | "right";
  /** How much scroll velocity warps the marquee speed. 0 disables. */
  velocityFactor?: number;
  /** px gap between repeated runs. */
  gap?: number;
  /** Number of duplicated runs (>=2 for a seamless loop). */
  repeat?: number;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const trackRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let offset = 0;
    let last = performance.now();
    const dir = direction === "left" ? -1 : 1;
    // Snappy feels run hotter; weighty/elegant glide.
    const feelSpeed = speed * (f.spring ? 1.15 : 0.9 + f.duration * 0.1);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const run = runRef.current;
      const track = trackRef.current;
      const width = run ? run.offsetWidth + gap : 0;
      if (track && width > 0) {
        const vel = velocityFactor !== 0 ? getScroll().velocity : 0;
        const extra = vel * velocityFactor;
        offset += dir * feelSpeed * dt + extra;
        // Wrap seamlessly.
        if (offset <= -width) offset += width;
        if (offset >= width) offset -= width;
        track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, direction, velocityFactor, gap, f]);

  const runs = Math.max(2, repeat);

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        // Subtle skew flavor for kinetic feels.
        transitionTimingFunction: EASE[f.ease],
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "inline-flex",
          gap,
          willChange: "transform",
        }}
      >
        {Array.from({ length: runs }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? runRef : undefined}
            style={{ display: "inline-flex", gap, flex: "none" }}
            aria-hidden={i !== 0}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
