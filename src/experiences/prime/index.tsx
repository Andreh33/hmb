"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { ScrollFilm } from "@/shared/scroll/ScrollFilm";
import { OrderBar } from "@/shared/convert/OrderBar";
import { CustomCursor } from "@/shared/motion/cursor";
import { useTier } from "@/shared/perf/Capability";
import { useExperience } from "@/experiences/ExperienceProvider";
import { getScroll } from "@/shared/scroll/scroll-store";
import { PrimeHeader } from "./sections/PrimeHeader";
import { PrimeHero } from "./sections/PrimeHero";
import { PrimeManifesto } from "./sections/PrimeManifesto";
import { PrimeMenu } from "./sections/PrimeMenu";
import { PrimeStory, PrimeLocation, PrimeFooter } from "./sections/PrimeSections";
import { PrimeFolioRail } from "./sections/PrimeFolioRail";
import { buildPrimeActs } from "./scroll";
import { primeArt } from "./art";

// Liquid lens cursor mounts a second canvas — full tier only, lazy + ssr:false.
const LiquidLensCursor = dynamic(
  () => import("./LiquidLensCursor").then((m) => m.LiquidLensCursor),
  { ssr: false },
);

/**
 * PRIME — Editorial Luxury + WebGL Fluid.
 *
 * Composition (not the shared shell): a masthead, a still duotone hero revealed
 * by liquid displacement with a GPU fluid glaze, a negative-space manifesto with
 * kinetic morphing serifs, an editorial carte ledger, story + location spreads
 * and a giant outline-to-fill footer. A folio rail indexes the museum; the page
 * TRANSFORMS on a clean scroll-scrub (ScrollFilm acts). Liquid-lens magnetic
 * cursor on capable devices, a DOM custom cursor otherwise.
 */
export default function PrimeExperience() {
  const tier = useTier();
  const { meta } = useExperience();
  const art = primeArt(meta.colors);
  // Built once; static for the lifetime of the experience.
  const acts = useMemo(() => buildPrimeActs(), []);

  // Velocity-reactive section "veil": a gilt grain that flares during fast
  // scroll and settles when still — a cheap shader-feel transition between
  // sections without a third always-on canvas. RAF, no re-render.
  const veilRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let cur = 0;
    const tick = () => {
      const { velocity } = getScroll();
      const target = Math.min(1, Math.abs(velocity) * 0.04);
      // Asymmetric smoothing: flares quickly on acceleration, settles slowly —
      // motion that has weight on the way out, like a curtain catching light.
      const k = target > cur ? 0.18 : 0.06;
      cur += (target - cur) * k;
      const el = veilRef.current;
      if (el) {
        el.style.opacity = (cur * 0.5).toFixed(3);
        // A faint vertical drift on the grain so fast scroll smears the gild.
        el.style.transform = `translate3d(0, ${(-velocity * 0.6).toFixed(1)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lensCursor = tier.tier === "full";

  return (
    <main
      className="relative min-h-screen"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
        // On the bespoke cursor tier, retire the OS arrow so the lens leads.
        cursor: lensCursor ? "none" : "auto",
      }}
    >
      <PrimeHeader />
      <PrimeFolioRail />

      <ScrollFilm acts={acts}>
        <PrimeHero />
        <PrimeManifesto />
        <PrimeMenu />
        <PrimeStory />
        <PrimeLocation />
        <PrimeFooter />
      </ScrollFilm>

      {/* Velocity gilt veil — pointer-safe, fixed, blended over the spread.
          Two stacked gradients (top + bottom) so fast scroll gilds both edges
          of the frame like raking light across a page. */}
      <div
        ref={veilRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[45] opacity-0 mix-blend-screen will-change-[opacity,transform]"
        style={{
          background:
            "radial-gradient(140% 70% at 50% -10%, color-mix(in srgb, var(--color-accent) 34%, transparent), transparent 52%), radial-gradient(140% 70% at 50% 110%, color-mix(in srgb, var(--color-accent2) 24%, transparent), transparent 52%)",
          transition: "opacity 0.08s linear",
        }}
      />

      {/* Cursor: liquid lens (full) layered with a refined DOM cursor; medio/lite
          get the DOM custom cursor alone. */}
      {lensCursor ? <LiquidLensCursor color={art.glaze} /> : null}
      <CustomCursor
        theme={
          lensCursor
            ? {
                // Full tier: the lens owns the halo; the DOM cursor is a precise
                // gilt bead with a near-invisible ring — just enough to anchor.
                size: 5,
                ringSize: 22,
                hoverScale: 2,
                color: "var(--color-accent)",
                ringColor: "color-mix(in srgb, var(--color-text) 35%, transparent)",
                blend: "normal",
              }
            : {
                // Medio/lite: no lens, so the ring carries more presence.
                size: 6,
                ringSize: 30,
                hoverScale: 1.7,
                color: "var(--color-accent)",
                ringColor: "var(--color-text)",
                blend: "normal",
              }
        }
      />

      <OrderBar />
    </main>
  );
}
