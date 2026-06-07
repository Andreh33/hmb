"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../motion";

/**
 * Neon blob that chases the cursor with eased lag and mix-blend-difference, so
 * it inverts whatever it passes over (type, photo, grid). Fixed, full-screen,
 * pointer-events:none. Pure transform writes in RAF — zero re-render. Hidden on
 * touch / reduced-motion.
 */
export function NeonBlob() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const el = ref.current;
    if (!el) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;
    let down = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      const s = down ? 1.6 : 1;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%,-50%) scale(${s})`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-40 w-40 rounded-full md:block"
      style={{
        mixBlendMode: "difference",
        background:
          "radial-gradient(circle at 50% 50%, var(--color-accent) 0%, var(--color-accent2) 55%, transparent 72%)",
        filter: "blur(6px)",
        transition: "transform 0.18s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
      }}
    />
  );
}
