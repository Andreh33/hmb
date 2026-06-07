"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { STICKERS } from "../theme";
import { T } from "../anim";

/** Initial scatter positions (vw/vh-ish via inline left/top %). */
const SPOTS = [
  { left: "8%", top: "30%", rot: -12 },
  { left: "78%", top: "22%", rot: 9 },
  { left: "64%", top: "68%", rot: -6 },
  { left: "16%", top: "74%", rot: 14 },
];

/**
 * Draggable neon stickers scattered over the hero. They snap-rotate on grab,
 * carry the brutalist box-neon border, and stay constrained to the hero box.
 * Pointer-events live only on the stickers themselves so the hero stays usable.
 */
export function Stickers({ constraintsId }: { constraintsId: string }) {
  // Resolve the drag-constraint element AFTER mount — touching `document`
  // during render would crash SSR. Holding it in a ref means we never trigger a
  // re-render either; framer reads `.current` lazily when a drag begins.
  const constraintsRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    constraintsRef.current = document.getElementById(constraintsId);
  }, [constraintsId]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden md:block">
      {STICKERS.map((s, i) => {
        const spot = SPOTS[i] ?? SPOTS[0]!;
        const color =
          s.tone === "accent"
            ? "var(--color-accent)"
            : "var(--color-accent2)";
        return (
          <motion.button
            key={s.id}
            type="button"
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            dragMomentum={false}
            whileTap={{ scale: 1.12, rotate: spot.rot + 6 }}
            whileHover={{ scale: 1.06, rotate: spot.rot - 2 }}
            initial={{ rotate: spot.rot, opacity: 0, scale: 0.6 }}
            animate={{ rotate: spot.rot, opacity: 1, scale: 1 }}
            transition={{ ...T.pop, delay: 0.7 + i * 0.08 }}
            className="smash-display pointer-events-auto absolute cursor-grab select-none px-3 py-2 text-sm uppercase tracking-widest text-[var(--color-bg)] active:cursor-grabbing"
            style={{
              left: spot.left,
              top: spot.top,
              background: color,
              boxShadow: "4px 4px 0 0 var(--color-text)",
            }}
          >
            {s.label}
          </motion.button>
        );
      })}
    </div>
  );
}
