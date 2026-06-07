"use client";

import { useEffect, useRef } from "react";
import type { HeroManifest } from "@/shared/hero/manifest";
import { HeroFrameScrub } from "../HeroFrameScrub";
import { onAct } from "../scroll";
import { clamp01, emberEase } from "../motion";

/**
 * Morph → Carta bridge (pinned). The assembled burger detaches from centre
 * stage and travels + contracts into a card-shaped frame (the visual handoff
 * into the carta), while the word "CARTA" resolves behind it and a card chrome
 * draws around the shrinking stage. Scrubbed entirely by transforms (GPU) so it
 * holds 60fps. The real, interactive carta renders immediately after.
 */
export function Morph({ manifest }: { manifest: HeroManifest }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return onAct("morph", (raw) => {
      const p = emberEase(clamp01(raw));
      const x = p * 22; // vw — shared travel so the chrome tracks the stage exactly
      const y = p * 6; // vh
      const stageScale = 1 - p * 0.46;

      const stage = stageRef.current;
      if (stage) {
        // Base -50%,-50% keeps it centred (we own the transform now), then the
        // travel + shrink composite on top.
        stage.style.transform = `translate(-50%, -50%) translate(${x.toFixed(3)}vw, ${y.toFixed(3)}vh) scale(${stageScale.toFixed(4)})`;
      }
      if (cardRef.current) {
        // The chrome materialises around the SAME travelling point + a hair
        // larger than the stage so it reads as a frame closing in on the burger.
        const cardScale = stageScale + 0.06;
        cardRef.current.style.opacity = String(clamp01((p - 0.4) / 0.45));
        cardRef.current.style.transform = `translate(-50%, -50%) translate(${x.toFixed(3)}vw, ${y.toFixed(3)}vh) scale(${cardScale.toFixed(4)})`;
        // Border kindles from dim to gold as it locks on.
        const glow = clamp01((p - 0.5) / 0.5);
        cardRef.current.style.boxShadow = `0 0 ${(glow * 60).toFixed(1)}px rgba(224,153,47,${(glow * 0.25).toFixed(3)})`;
      }
      if (wordRef.current) {
        // "CARTA" resolves: slides in, tightens tracking, brightens. Keep the
        // -50% Y centering (we own transform now) so it never drops on first paint.
        wordRef.current.style.opacity = String(clamp01((p - 0.1) * 1.6));
        wordRef.current.style.transform = `translateY(-50%) translateX(${((1 - p) * -6).toFixed(3)}vw)`;
        wordRef.current.style.letterSpacing = `${(0.02 + (1 - p) * 0.18).toFixed(3)}em`;
      }
    });
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      {/* Resolving headline behind the travelling stage */}
      <span
        ref={wordRef}
        className="absolute left-6 top-1/2 z-[1] -translate-y-1/2 text-[24vw] font-semibold leading-none text-[var(--color-accent)]/12 md:left-16 md:text-[18vw]"
        style={{ fontFamily: "var(--display)", opacity: 0 }}
        aria-hidden
      >
        CARTA
      </span>

      {/* Card chrome that materialises around the contracting stage */}
      <div
        ref={cardRef}
        className="absolute left-1/2 top-1/2 z-[2] h-[58vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius)] border border-[var(--color-accent)]/30 will-change-transform"
        style={{ opacity: 0 }}
        aria-hidden
      />

      {/* Travelling burger stage */}
      <div
        ref={stageRef}
        className="absolute left-1/2 top-1/2 z-[3] h-[64vmin] w-[64vmin] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <HeroFrameScrub manifest={manifest} act="morph" />
      </div>
    </div>
  );
}
