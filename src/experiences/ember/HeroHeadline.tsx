"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EMBER_EASE } from "./theme";
import { igniteOrder, prefersReducedMotion } from "./motion";

/**
 * Title that ignites letter-by-letter: each glyph kindles from cold charcoal
 * (dark, blurred, sunk) to molten gold with a brief heat flare, ordered
 * centre-out so the word "catches fire" from its core. Pure CSS/Motion — no
 * canvas — so it stays crisp and accessible (aria-label on the wrapper).
 */
export function HeroHeadline({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const [lit, setLit] = useState(false);
  // Lazy init keeps this out of an effect (no cascading render). SSR returns
  // false; the only client-side difference is animation pacing, and because the
  // headline starts unlit (animation fires post-mount) there is no visual
  // hydration mismatch.
  const [reduce] = useState(prefersReducedMotion);
  useEffect(() => {
    const delay = reduce ? 0 : 350;
    const id = window.setTimeout(() => setLit(true), delay);
    return () => window.clearTimeout(id);
  }, [reduce]);

  return (
    <h1
      className={className}
      aria-label={lines.join(" ")}
      style={{
        fontFamily: "var(--display)",
        fontKerning: "normal",
        textRendering: "optimizeLegibility",
      }}
    >
      {lines.map((line, li) => {
        const chars = Array.from(line);
        const order = igniteOrder(chars.length);
        const lineBase = li * chars.length * 0.045;
        return (
          <span key={li} className="block overflow-hidden">
            {chars.map((ch, i) => {
              const delay = reduce ? 0 : lineBase + (order[i] ?? 0) * 0.075;
              return (
                <motion.span
                  key={`${li}-${i}`}
                  aria-hidden
                  className="inline-block will-change-transform"
                  initial={{
                    opacity: 0,
                    y: reduce ? 0 : "0.5em",
                    color: "#2A211A",
                    filter: reduce
                      ? "blur(0px) brightness(1)"
                      : "blur(8px) brightness(0.4)",
                    textShadow: "0 0 0px rgba(224,153,47,0)",
                  }}
                  animate={
                    lit
                      ? {
                          opacity: 1,
                          y: 0,
                          color: "var(--color-text)",
                          filter: "blur(0px) brightness(1)",
                          textShadow: reduce
                            ? "0 0 10px rgba(224,153,47,0.3)"
                            : [
                                "0 0 0px rgba(224,153,47,0)",
                                "0 0 34px rgba(255,196,90,0.95)",
                                "0 0 12px rgba(224,153,47,0.4)",
                              ],
                        }
                      : undefined
                  }
                  transition={{
                    duration: reduce ? 0.4 : 1.05,
                    ease: EMBER_EASE,
                    delay,
                    textShadow: {
                      duration: reduce ? 0.4 : 1.35,
                      ease: "easeOut",
                      delay,
                    },
                  }}
                  style={{ whiteSpace: "pre" }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
