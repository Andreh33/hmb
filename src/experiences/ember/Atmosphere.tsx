"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * EMBER atmosphere layer — a single fixed full-viewport overlay that gives the
 * whole experience a coherent cinematic envelope:
 *
 *   • animated film grain (fine repeating noise tile regenerated on a slow ~24fps
 *     cadence so it shimmers like real emulsion rather than a static texture)
 *   • a soft volumetric heat haze rising from the lower edge
 *   • edge vignette so every section sits inside the same dark frame
 *
 * Pointer-events none, overlay/screen/multiply blends so it never muddies the
 * content. Honours prefers-reduced-motion (static grain). Mounts ONCE in
 * index.tsx so every act shares one grain field — this is what makes the piece
 * read as a single graded film instead of a stack of components.
 */
export function Atmosphere() {
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grainRef.current;
    if (!el) return;

    const reduce = prefersReducedMotion();
    const TILE = 128;
    const off = document.createElement("canvas");
    off.width = TILE;
    off.height = TILE;
    const ctx = off.getContext("2d", { alpha: true });
    if (!ctx) return;

    const img = ctx.createImageData(TILE, TILE);
    const d = img.data;

    const renderGrain = () => {
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v; // r
        d[i + 1] = (v * 0.93) | 0; // g — faint warm cast
        d[i + 2] = (v * 0.8) | 0; // b
        d[i + 3] = 30 + ((Math.random() * 30) | 0); // sparse alpha
      }
      ctx.putImageData(img, 0, 0);
      el.style.backgroundImage = `url(${off.toDataURL()})`;
    };

    el.style.backgroundRepeat = "repeat";
    el.style.backgroundSize = "180px 180px";
    renderGrain();

    if (reduce) return; // static grain — no loop

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 56) return; // ~18fps projector flicker
      last = now;
      renderGrain();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {/* Volumetric heat rising from the floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[42vh]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 120%, rgba(224,153,47,0.10), rgba(140,28,19,0.04) 38%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Frame vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 120% at 50% 42%, transparent 55%, rgba(7,6,5,0.5) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Animated film grain tile */}
      <div
        ref={grainRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.45, mixBlendMode: "overlay" }}
      />
    </div>
  );
}
