"use client";

import { useEffect, useRef } from "react";
import { getScroll } from "@/shared/scroll/scroll-store";
import { prefersReducedMotion } from "../motion";

/**
 * SMASH atmosphere — what turns flat brutalism into a lit room. Two roots:
 *
 *  BEHIND (z-0, under the content):
 *   - Volumetric neon wash: two huge soft radial blooms (accent + accent2) that
 *     breathe and drift with scroll so the dark bg never reads as dead black.
 *
 *  FRONT (z-[55], over the content, never over the cursor blob at z-[60]):
 *   - Scanlines: faint CRT rule, 3px pitch.
 *   - Film grain: animated SVG turbulence, low opacity, blend overlay.
 *   - Vignette: radial darkening that holds focus center-screen.
 *
 * Registry has grain:false (the SHARED grain stays off); this is SMASH's own
 * scoped grain, intentional to the look. All motion is RAF transform / CSS
 * keyframes (zero re-render) and fully disabled under reduced-motion.
 */
export function Atmosphere() {
  const washRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = washRef.current;
    if (!el) return;
    let raf = 0;
    let cur = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = getScroll().progress;
      cur += (p - cur) * 0.06; // glide toward scroll progress
      el.style.transform = `translate3d(0, ${(cur * -16).toFixed(2)}vh, 0)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Behind the content */}
      <div aria-hidden className="smash-atmos-bg pointer-events-none fixed inset-0 z-0">
        <div ref={washRef} className="smash-atmos-wash" style={{ willChange: "transform" }} />
      </div>

      {/* Over the content */}
      <div aria-hidden className="smash-atmos-fg pointer-events-none fixed inset-0 z-[55]">
        <div className="smash-atmos-scan" />
        <div className="smash-atmos-grain" />
        <div className="smash-atmos-vignette" />
      </div>
    </>
  );
}
