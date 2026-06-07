"use client";

import { AnimatePresence, motion } from "motion/react";
import { useExperience } from "./ExperienceProvider";

/**
 * Cinematic overlay that covers the page during an experience swap (§9.E).
 * A curtain wipe tinted with the incoming accent. A-INTPOLISH adds the
 * iris/morph/liquid variants per pair.
 */
export function ExperienceTransition() {
  const { transitioning, meta } = useExperience();
  return (
    <AnimatePresence>
      {transitioning ? (
        <motion.div
          key="exp-transition"
          aria-hidden
          initial={{ scaleY: 0, transformOrigin: "bottom" }}
          animate={{ scaleY: 1, transformOrigin: "bottom" }}
          exit={{ scaleY: 0, transformOrigin: "top" }}
          transition={{ duration: 0.5, ease: [0.85, 0, 0.15, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: meta.colors.bg,
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: meta.colors.accent,
              fontFamily: "var(--display)",
              fontSize: "clamp(2rem, 8vw, 6rem)",
              letterSpacing: "0.05em",
            }}
          >
            {meta.brand}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
