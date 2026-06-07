"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFlyToCart, type FlyPayload } from "./fly-to-cart";
import { EASE_ARR } from "@/shared/motion/easings";

interface Flight {
  id: number;
  from: DOMRect;
  to: { x: number; y: number };
  image?: string;
  color: string;
}

/**
 * Renders the "fly to cart" ghost. Listens to fly events emitted by menu cards
 * and animates a small puck from the source rect to the cart anchor's current
 * position. The anchor position is resolved lazily at fire-time so it tracks a
 * moving / responsive cart button.
 */
export function FlyToCartLayer({
  getTarget,
}: {
  /** Returns the cart anchor's live bounding rect (or null if not mounted). */
  getTarget: () => DOMRect | null;
}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const seq = useRef(0);

  const onFly = useCallback(
    (p: FlyPayload) => {
      const target = getTarget();
      if (!target) return;
      const id = ++seq.current;
      setFlights((f) => [
        ...f,
        {
          id,
          from: p.from,
          to: {
            x: target.left + target.width / 2,
            y: target.top + target.height / 2,
          },
          image: p.image,
          color: p.color ?? "var(--color-accent)",
        },
      ]);
      window.setTimeout(() => {
        setFlights((f) => f.filter((fl) => fl.id !== id));
      }, 750);
    },
    [getTarget],
  );

  useFlyToCart(onFly);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <AnimatePresence>
        {flights.map((fl) => {
          const startX = fl.from.left + fl.from.width / 2;
          const startY = fl.from.top + fl.from.height / 2;
          const size = Math.min(72, Math.max(40, fl.from.width * 0.4));
          return (
            <motion.div
              key={fl.id}
              initial={{ x: startX - size / 2, y: startY - size / 2, scale: 1, opacity: 1 }}
              animate={{
                x: [startX - size / 2, fl.to.x - size / 2],
                y: [startY - size / 2, startY - 120, fl.to.y - size / 2],
                scale: [1, 0.9, 0.25],
                opacity: [1, 1, 0.2],
              }}
              transition={{ duration: 0.7, ease: EASE_ARR.lux }}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "var(--glow)",
                background: fl.color,
              }}
            >
              {fl.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fl.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
