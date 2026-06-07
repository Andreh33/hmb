"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getScroll } from "@/shared/scroll/scroll-store";

// RUTA 66 atmosphere — a fixed, non-interactive overlay that gives the whole
// page its retro-print "weight": halftone dot screen, warm paper grain, a soft
// top-light bloom and a vignette. A RAF reads the shared scroll velocity to
// drift the halftone parallax and breathe the bloom — no React re-renders.

export function Atmosphere() {
  const reduce = useReducedMotion();
  const halftoneRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let y = 0;
    let glow = 0;
    const tick = () => {
      const { progress, velocity } = getScroll();
      // Halftone drifts slowly down-page; velocity adds momentary lead.
      const targetY = progress * 40 + velocity * 0.4;
      y += (targetY - y) * 0.08;
      // Bloom breathes with scroll energy.
      const targetGlow = Math.min(0.42, 0.2 + Math.abs(velocity) * 0.012);
      glow += (targetGlow - glow) * 0.06;
      const ht = halftoneRef.current;
      const bl = bloomRef.current;
      if (ht) ht.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      if (bl) bl.style.opacity = glow.toFixed(3);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ mixBlendMode: "normal" }}
    >
      {/* Warm top-light bloom — anchors the "diner window" light source. */}
      <div
        ref={bloomRef}
        className="absolute inset-x-0 top-0 h-[55vh]"
        style={{
          opacity: 0.22,
          background:
            "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--glaze) 70%, transparent) 0%, transparent 60%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Halftone dot screen — the signature retro-print texture. */}
      <div
        ref={halftoneRef}
        className="absolute -inset-y-[10%] inset-x-0"
        style={{
          opacity: 0.06,
          backgroundImage:
            "radial-gradient(var(--color-text) 1px, transparent 1.4px)",
          backgroundSize: "6px 6px",
          mixBlendMode: "multiply",
        }}
      />

      {/* Paper grain via fractal noise (data-URI SVG, no asset). */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.08,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "multiply",
        }}
      />

      {/* Edge vignette for focus. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 55%, color-mix(in srgb, var(--color-text) 16%, transparent) 100%)",
        }}
      />
    </div>
  );
}
