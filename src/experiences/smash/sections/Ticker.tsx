"use client";

import { Fragment } from "react";
import { KineticMarquee } from "@/shared/motion/primitives";
import { TICKER_WORDS } from "../theme";

/**
 * Velocity-reactive ticker strip. Reuses the shared KineticMarquee (scroll
 * velocity warps the crawl) and dresses it as a brutalist neon band with hard
 * top/bottom rules and blinking diamond separators.
 */
export function Ticker({
  direction = "left",
  tone = "accent",
}: {
  direction?: "left" | "right";
  tone?: "accent" | "accent2";
}) {
  const color =
    tone === "accent" ? "var(--color-accent)" : "var(--color-accent2)";
  return (
    <div
      className="relative w-full overflow-hidden border-y-2 border-[var(--color-text)] py-3"
      style={{
        background: color,
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)",
      }}
    >
      <KineticMarquee
        speed={90}
        direction={direction}
        velocityFactor={1.1}
        gap={0}
        className="smash-display smash-tight text-[clamp(1.5rem,3.4vw,2.6rem)] uppercase text-[var(--color-bg)]"
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
}
