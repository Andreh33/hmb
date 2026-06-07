"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EMBER_EASE } from "../theme";
import { prefersReducedMotion } from "../motion";

/**
 * Preload → Reveal curtain. A charred panel holds the brand kindling from
 * dark to gold, then lifts (clip-path) to unveil the hero. Fixed overlay,
 * removes itself after the reveal so it never blocks interaction. Pure CSS +
 * Motion — no asset dependency, so it can't stall the first paint.
 */
export function Preload() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hold = prefersReducedMotion() ? 600 : 1600;
    const id = window.setTimeout(() => setDone(true), hold);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="ember-preload"
          className="fixed inset-0 z-[200] grid place-items-center bg-[var(--color-bg)]"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.1, ease: EMBER_EASE }}
        >
          <motion.span
            className="text-5xl font-semibold tracking-[0.1em] md:text-7xl"
            style={{ fontFamily: "var(--display)" }}
            initial={{
              color: "#2A211A",
              textShadow: "0 0 0 rgba(224,153,47,0)",
              letterSpacing: "0.4em",
            }}
            animate={{
              color: "var(--color-accent)",
              textShadow: [
                "0 0 0px rgba(224,153,47,0)",
                "0 0 40px rgba(224,153,47,0.9)",
                "0 0 14px rgba(224,153,47,0.4)",
              ],
              letterSpacing: "0.1em",
            }}
            transition={{ duration: 1.3, ease: EMBER_EASE }}
          >
            EMBER
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-accent)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
