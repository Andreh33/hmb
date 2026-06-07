"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { feelFor } from "./timings";

export type CursorVariant = "default" | "hover" | "drag" | "view" | "hidden";

export interface CursorTheme {
  /** Resting dot diameter in px. */
  size: number;
  /** Outer ring diameter in px. */
  ringSize: number;
  /** Ring scale multiplier when hovering an interactive target. */
  hoverScale: number;
  /** CSS color for the dot. */
  color: string;
  /** CSS color for the ring. */
  ringColor: string;
  /** mix-blend-mode for the cursor layer. */
  blend: "normal" | "difference" | "exclusion" | "screen";
}

const DEFAULT_THEME: CursorTheme = {
  size: 8,
  ringSize: 36,
  hoverScale: 1.8,
  color: "var(--accent)",
  ringColor: "var(--text)",
  blend: "difference",
};

/**
 * CustomCursor — a GPU-cheap, RAF-driven custom pointer parameterized by the
 * active experience. The dot tracks the pointer 1:1; the ring lerps behind it
 * with a follow factor derived from the experience's motionFeel (snappy feels
 * follow tighter, elegant/continuous feels drift). Reacts to `data-cursor`
 * attributes on hovered elements (e.g. data-cursor="hover" / "drag" / "view").
 *
 * Renders nothing on touch / coarse-pointer devices.
 */
export function CustomCursor({
  theme: themeOverride,
  label,
}: {
  theme?: Partial<CursorTheme>;
  /** Optional text shown inside the ring on "view"/"drag" variants. */
  label?: string;
}) {
  const { meta } = useExperience();
  const f = feelFor(meta.motionFeel);
  const theme: CursorTheme = { ...DEFAULT_THEME, ...themeOverride };

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [labelText, setLabelText] = useState<string>("");

  // Detect fine pointer (mouse) — skip custom cursor on touch.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Follow tightness from feel: snappy/bouncy chase harder, elegant drifts.
    const follow = f.spring
      ? Math.min(0.35, (f.spring.stiffness / 520) * 0.3)
      : Math.max(0.08, 0.22 - f.duration * 0.12);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
      // Resolve variant from the topmost element under the pointer.
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      if (el) {
        const v = (el.dataset.cursor ?? "hover") as CursorVariant;
        setVariant(v);
        setLabelText(el.dataset.cursorLabel ?? label ?? "");
      } else {
        setVariant("default");
        setLabelText("");
      }
    };

    const onLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * follow;
      ring.y += (target.y - ring.y) * follow;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled, f, label]);

  if (!enabled) return null;

  const isHidden = variant === "hidden";
  const ringScale =
    variant === "hover"
      ? theme.hoverScale
      : variant === "view" || variant === "drag"
        ? theme.hoverScale * 1.9
        : 1;
  const showLabel = (variant === "view" || variant === "drag") && labelText;
  const ringTransition = f.spring
    ? `${Math.min(0.5, 1 / (f.spring.stiffness / 200))}s cubic-bezier(0.34,1.56,0.64,1)`
    : `${f.duration * 0.5}s cubic-bezier(0.16,1,0.3,1)`;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        mixBlendMode: theme.blend,
      }}
    >
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: theme.size,
          height: theme.size,
          borderRadius: "50%",
          background: theme.color,
          opacity: 0,
          willChange: "transform",
          transition: `opacity 0.3s, width 0.25s, height 0.25s`,
          ...(isHidden ? { width: 0, height: 0 } : null),
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: theme.ringSize,
          height: theme.ringSize,
          borderRadius: "50%",
          border: `1px solid ${theme.ringColor}`,
          background: showLabel ? theme.color : "transparent",
          color: theme.ringColor,
          display: "grid",
          placeItems: "center",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "var(--body)",
          opacity: isHidden ? 0 : 0,
          transform: `scale(${ringScale})`,
          transformOrigin: "center",
          willChange: "transform",
          transition: `transform ${ringTransition}, opacity 0.3s, background 0.3s`,
        }}
      >
        {showLabel ? labelText : null}
      </div>
    </div>
  );
}
