"use client";

import { useEffect, useRef } from "react";
import type { HeroManifest } from "./manifest";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * 2.5D parallax hero. Each ingredient PNG sits on its own depth plane;
 * translate/scale/rotate ∝ progress·depth → photorealistic explosion/assembly.
 * Pure DOM transforms (compositor-only) → 60fps everywhere incl. Safari.
 */
export function LayeredParallax({
  manifest,
  className,
  explode = 1,
}: {
  manifest: HeroManifest;
  className?: string;
  /** Multiplier for how far layers separate at full progress. */
  explode?: number;
}) {
  const layers = manifest.layers ?? [];
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const prog = getScroll().progress;
      const vel = getScroll().velocity;
      layers.forEach((layer, i) => {
        const el = refs.current[i];
        if (!el) return;
        const d = layer.depth;
        const y = -(prog * 220 * d * explode);
        const scale = 1 + prog * 0.12 * d;
        const skew = Math.max(-8, Math.min(8, vel * 0.4 * d));
        const rot = (d - 0.5) * prog * 10;
        el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale}) rotate(${rot}deg) skewX(${skew}deg)`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layers, explode]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {layers.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${layer.src})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            willChange: "transform",
            zIndex: Math.round(layer.depth * 100),
          }}
        />
      ))}
    </div>
  );
}
