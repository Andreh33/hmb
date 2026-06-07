"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>";

/**
 * Decodes its text from random glyphs to the final string, character by
 * character, when it scrolls into view. Reduced-motion shows the final text.
 */
export function ScrambleText({
  text,
  className = "",
  speed = 30,
}: {
  text: string;
  className?: string;
  /** ms between scramble frames. */
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [out, setOut] = useState(reduce ? text : "");

  useEffect(() => {
    if (!inView || reduce) return;
    let frame = 0;
    const total = text.length * 3;
    const id = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / total) * text.length);
      const next = Array.from(text)
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (i < revealed) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? ch;
        })
        .join("");
      setOut(next);
      if (frame >= total) {
        setOut(text);
        window.clearInterval(id);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, reduce, text, speed]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={text}>
      <span aria-hidden>{out || text}</span>
    </span>
  );
}
