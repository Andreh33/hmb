"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { HeroManifest } from "@/shared/hero/manifest";
import { HeroFrameScrub } from "../HeroFrameScrub";
import { EMBER_INGREDIENTS } from "../theme";
import { STAGE_RINGS, leaderLine } from "../art";
import { onAct } from "../scroll";
import { clamp01, emberEase } from "../motion";

/**
 * Ingredients act (pinned). A rotating stage holds the burger while four
 * leader lines DRAW outward (stroke-dashoffset) and labels fade in, one per
 * quarter of the scrub. Editorial dossier of what's inside — neutral copy, no
 * invented claims. The whole stage counter-rotates subtly for parallax depth.
 */
export function Ingredients({ manifest }: { manifest: HeroManifest }) {
  const locale = useLocale() as Locale;
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = svgRef.current?.querySelectorAll<SVGPathElement>("path[data-leader]");
    const dots = svgRef.current?.querySelectorAll<SVGCircleElement>("circle[data-tip]");
    const labels = stageRef.current?.querySelectorAll<HTMLElement>("[data-label]");

    return onAct("ingredients", (p) => {
      // Slow rotation of the whole stage across the act.
      if (stageRef.current) {
        stageRef.current.style.transform = `rotate(${(-6 + p * 12).toFixed(2)}deg)`;
      }
      if (titleRef.current) {
        titleRef.current.style.opacity = String(clamp01(1 - p * 1.6));
        titleRef.current.style.transform = `translateY(${(p * -40).toFixed(1)}px)`;
      }
      const n = EMBER_INGREDIENTS.length;
      lines?.forEach((path, i) => {
        const seg = (i / n) * 0.7;
        const local = clamp01((p - seg) / 0.3);
        const eased = emberEase(local);
        // pathLength is normalised to 1, so offset against the unit, not px.
        path.style.strokeDashoffset = String(1 - eased);
        const dot = dots?.[i];
        if (dot) {
          // Tip dot fades in as the line lands, then gently pulses (alive ember).
          const lit = clamp01((local - 0.85) / 0.15);
          const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 420 + i);
          dot.style.opacity = String(lit * pulse);
        }
        const label = labels?.[i];
        if (label) {
          // Label resolves with the eased curve, drifting in from the line side.
          label.style.opacity = String(eased);
          const off = (1 - eased) * (label.dataset.side === "left" ? 18 : -18);
          label.style.transform = `translate(${off.toFixed(1)}px, 0)`;
        }
      });
    });
  }, []);

  const cx = 50;
  const cy = 50;
  const radius = 46;

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      <div
        ref={titleRef}
        className="absolute left-6 top-[14vh] z-10 max-w-md md:left-16"
      >
        <p
          className="mb-3 text-xs uppercase tracking-[0.42em] text-[var(--color-accent)]"
          style={{ fontFamily: "var(--body)" }}
        >
          Anatomía
        </p>
        <h2
          className="text-5xl font-semibold leading-[0.9] tracking-tight text-[var(--color-text)] md:text-7xl"
          style={{ fontFamily: "var(--display)" }}
        >
          Cuatro
          <br />
          materias.
        </h2>
      </div>

      {/* Rotating burger stage + leader lines */}
      <div className="relative h-[78vmin] w-[78vmin]">
        <div ref={stageRef} className="absolute inset-0 will-change-transform">
          <div className="absolute inset-[14%]">
            <HeroFrameScrub manifest={manifest} act="ingredients" />
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          {STAGE_RINGS.map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={r}
              stroke="var(--color-accent)"
              strokeOpacity={0.12}
              strokeWidth={0.15}
            />
          ))}
          {EMBER_INGREDIENTS.map((ing) => {
            const { d, tipX, tipY } = leaderLine(cx, cy, radius, ing.angle, ing.reach);
            return (
              <g key={ing.id}>
                <path
                  data-leader
                  d={d}
                  stroke="var(--color-accent)"
                  strokeWidth={0.3}
                  strokeLinecap="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                  }}
                />
                <circle
                  data-tip
                  cx={tipX}
                  cy={tipY}
                  r={0.8}
                  fill="var(--color-accent)"
                  style={{ opacity: 0 }}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML labels positioned at leader tips */}
        {EMBER_INGREDIENTS.map((ing) => {
          const { tipX, tipY, side } = leaderLine(cx, cy, radius, ing.angle, ing.reach);
          return (
            <div
              key={ing.id}
              data-label
              data-side={side}
              className="absolute z-10 w-40 will-change-transform"
              style={{
                left: `${tipX}%`,
                top: `${tipY}%`,
                transform: "translate(0,0)",
                opacity: 0,
                ...(side === "left"
                  ? { translate: "-100% -50%", textAlign: "right" }
                  : { translate: "0 -50%" }),
              }}
            >
              <p
                className="text-base font-semibold text-[var(--color-text)] md:text-lg"
                style={{ fontFamily: "var(--display)" }}
              >
                {ing.label[locale]}
              </p>
              <p
                className="text-[0.7rem] uppercase tracking-[0.15em] text-[var(--color-muted)]"
                style={{ fontFamily: "var(--body)" }}
              >
                {ing.note[locale]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
