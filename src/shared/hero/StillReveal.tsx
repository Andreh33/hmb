"use client";

import { useEffect, useRef } from "react";
import type { HeroManifest } from "./manifest";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * Single photo, enhanced: clip-path reveal + parallax Ken-Burns. Universal
 * fallback (always available). WebGL displacement reveal is layered on top by
 * the fx library for higher tiers; this DOM baseline never breaks.
 */
export function StillReveal({
  manifest,
  className,
}: {
  manifest: HeroManifest;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focal = manifest.focal ?? [0.5, 0.5];

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = ref.current;
      if (!el) return;
      const prog = getScroll().progress;
      const scale = 1.08 + prog * 0.14;
      const y = prog * -60;
      el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      // Clip reveal: wipes open over the first 25% of scroll.
      const reveal = Math.min(1, prog / 0.25);
      el.style.clipPath = `inset(${(1 - reveal) * 18}% 0% 0% 0%)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${manifest.still})`,
        backgroundSize: "cover",
        backgroundPosition: `${focal[0] * 100}% ${focal[1] * 100}%`,
        willChange: "transform, clip-path",
      }}
    />
  );
}
