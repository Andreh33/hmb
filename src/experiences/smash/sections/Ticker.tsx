"use client";

import { Fragment } from "react";
import { KineticMarquee } from "@/shared/motion/primitives";
import { TICKER_WORDS } from "../theme";

/**
 * Velocity-reactive ticker strip. Reuses the shared KineticMarquee (scroll
 * velocity warps the crawl) and dresses it as a brutalist neon band with hard
 * top/bottom rules and blinking diamond separators.
 *
 * `tilt` (deg) turns it into a diagonal banner that bleeds off both edges — a
 * loud, angled marquee cutting across the layout. `big` scales the type up.
 */
export function Ticker({
  direction = "left",
  tone = "accent",
  tilt = 0,
  big = false,
}: {
  direction?: "left" | "right";
  tone?: "accent" | "accent2";
  tilt?: number;
  big?: boolean;
}) {
  const color =
    tone === "accent" ? "var(--color-accent)" : "var(--color-accent2)";

  const band = (
    <div
      className={`relative w-full overflow-hidden border-y-2 border-[var(--color-text)] ${big ? "py-4 md:py-5" : "py-3"}`}
      style={{
        background: color,
        boxShadow: tilt
          ? "inset 0 0 40px rgba(0,0,0,0.28), 0 0 calc(34px*var(--glow)) color-mix(in srgb, " +
            color +
            " 65%, transparent)"
          : "inset 0 0 40px rgba(0,0,0,0.25)",
      }}
    >
      <KineticMarquee
        speed={90}
        direction={direction}
        velocityFactor={1.1}
        gap={0}
        className={`smash-display smash-tight uppercase text-[var(--color-bg)] ${
          big
            ? "text-[clamp(1.9rem,4.6vw,3.4rem)]"
            : "text-[clamp(1.5rem,3.4vw,2.6rem)]"
        }`}
      >
        {TICKER_WORDS.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className="px-6">{w}</span>
            <span
              className="px-2"
              style={{ animation: "smash-blink 0.9s steps(1) infinite" }}
              aria-hidden
            >
              ◆
            </span>
          </Fragment>
        ))}
      </KineticMarquee>
    </div>
  );

  if (!tilt) return band;

  // Diagonal banner: rotate + over-bleed past both viewport edges so the ends
  // never show, and clip horizontally to avoid a scrollbar.
  return (
    <div
      className="relative my-6 md:my-10"
      style={{ overflowX: "clip", overflowY: "visible" }}
      aria-hidden={false}
    >
      <div
        style={{
          transform: `rotate(${tilt}deg)`,
          width: "120vw",
          marginLeft: "-10vw",
        }}
      >
        {band}
      </div>
    </div>
  );
}
