"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroManifest } from "@/shared/hero/manifest";
import { GlazeOverlay } from "@/shared/hero/GlazeOverlay";
import { Magnetic } from "@/shared/motion/primitives";
import { HeroFrameScrub } from "./HeroFrameScrub";
import { HeroHeadline } from "./HeroHeadline";
import { EmberSparks } from "./EmberSparks";
import { HERO_HEADLINE, HERO_KICKER } from "./theme";
import { onAct } from "./scroll";
import { clamp01, smoothstep } from "./motion";

/**
 * EMBER hero — the pinned montage stage (act 0). Asymmetric editorial layout:
 * the assembling burger lives slightly right-of-centre, the igniting headline
 * sits low-left, generous negative space, gold on near-black. As you scroll the
 * pinned act, the burger frame-scrubs together, glaze descends, embers gather,
 * and the headline copy holds while the kicker/cue recede. The centre stage
 * carries id="ember-hero-stage" so the morph act can FLIP it into the first
 * menu card.
 */
export function Hero({ manifest }: { manifest: HeroManifest }) {
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);

  // React to montage progress imperatively (no re-render churn). Exits are
  // choreographed as carefully as the entrance: copy doesn't just fade — it
  // recedes on a smoothstep with a touch of blur so the hero dissolves into the
  // build rather than snapping off. Elements stagger out (cue → kicker → CTA →
  // headline) so the eye is handed to the assembling burger.
  useEffect(() => {
    return onAct("montage", (p) => {
      if (cueRef.current) {
        cueRef.current.style.opacity = String(clamp01(1 - p * 5));
        cueRef.current.style.transform = `translate(-50%, ${p * 18}px)`;
      }
      if (kickerRef.current) {
        const k = smoothstep(0.0, 0.4, p);
        kickerRef.current.style.opacity = String(1 - k);
        kickerRef.current.style.transform = `translateY(${k * -28}px)`;
      }
      if (ctaRef.current) {
        const c = smoothstep(0.08, 0.5, p);
        ctaRef.current.style.opacity = String(1 - c);
        ctaRef.current.style.transform = `translateY(${c * 22}px)`;
        ctaRef.current.style.pointerEvents = c > 0.5 ? "none" : "auto";
      }
      if (headlineRef.current) {
        // Headline holds longest, then sinks + blurs as the burger takes over.
        const hl = smoothstep(0.45, 1, p);
        headlineRef.current.style.opacity = String(1 - hl * 0.92);
        headlineRef.current.style.transform = `translateY(${hl * -40}px)`;
        headlineRef.current.style.filter = `blur(${(hl * 6).toFixed(2)}px)`;
      }
      if (stageRef.current) {
        // Slow weighty rise + scale as the burger builds.
        stageRef.current.style.transform = `translateY(${p * -3}vh) scale(${1 + p * 0.06})`;
      }
      if (p > 0.04 && hint) setHint(false);
    });
  }, [hint]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      {/* Ambient ember field (R3F, lazy, ssr:false) */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <EmberSparks />
      </div>

      {/* Assembling burger — right-of-centre, the focal stage */}
      <div
        ref={stageRef}
        id="ember-hero-stage"
        data-flip-id="ember-hero"
        className="absolute inset-y-0 right-0 z-[2] h-full w-full will-change-transform md:left-[28%] md:w-[72%]"
      >
        <HeroFrameScrub manifest={manifest} act="montage" />
        <GlazeOverlay color="var(--color-glaze)" />
      </div>

      {/* Editorial copy — low-left, lots of air */}
      <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-end px-6 pb-[14vh] md:px-16 md:pb-[12vh]">
        <p
          ref={kickerRef}
          className="mb-5 max-w-xs text-[0.7rem] uppercase tracking-[0.42em] text-[var(--color-accent)] will-change-transform md:text-xs"
          style={{ fontFamily: "var(--body)" }}
        >
          {HERO_KICKER}
        </p>
        <div ref={headlineRef} className="will-change-transform">
          <HeroHeadline
            lines={HERO_HEADLINE}
            className="text-[19vw] font-semibold leading-[0.82] tracking-[-0.035em] text-[var(--color-text)] md:text-[13vw] lg:text-[11rem]"
          />
        </div>
        <div
          ref={ctaRef}
          className="pointer-events-auto mt-8 flex items-center gap-5 will-change-transform"
        >
          <Magnetic strength={0.5}>
            <a
              href="#carta"
              data-cursor="hover"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[var(--radius)] border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 px-7 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text)] backdrop-blur-sm transition-colors duration-500 hover:text-[var(--color-bg)]"
              style={{ fontFamily: "var(--body)" }}
            >
              {/* Ember sweep — gold floods from left on hover (weighty ease). */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
              <span className="relative">Ver la carta</span>
              <span className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                →
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={cueRef}
        className="absolute bottom-6 left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--color-muted)] transition-opacity"
      >
        <span
          className="text-[0.6rem] uppercase tracking-[0.4em]"
          style={{ fontFamily: "var(--body)" }}
        >
          Desliza · el fuego empieza
        </span>
        <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-[var(--color-accent)] to-transparent" />
      </div>

      {/* Top grade wash so the header reads over the bright stage */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-40 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
    </div>
  );
}
