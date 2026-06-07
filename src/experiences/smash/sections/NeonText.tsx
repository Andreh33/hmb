"use client";

import { useEffect, useRef } from "react";

/**
 * SMASH "neon ignition" text. Starts dim (muted, low-strength — the look the
 * client liked) and LIGHTS UP as it scrolls up the viewport: a per-element
 * brightness `--lit` (0→1) drives color (muted→accent) + a growing neon glow.
 * Once fully lit it gains the gas-tube FLICKER (smash-neon-flicker); scrolling
 * it back down dims + stops the flicker. Apply to SOME texts, not all.
 *
 * Perf: one shared RAF ticks every registered element (cheap rect read +
 * CSS-var write), so 1 or 50 instances cost a single loop.
 */

type Entry = { el: HTMLElement; flickering: boolean };

const entries = new Set<Entry>();
let raf = 0;

function loop() {
  raf = requestAnimationFrame(loop);
  const vh = window.innerHeight || 800;
  const start = vh * 0.92; // begins lighting when its top enters near the bottom
  const end = vh * 0.42; // fully lit once it reaches the upper-middle band
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
    e.el.style.setProperty("--lit", v.toFixed(3));
    const lit = v >= 0.985;
    if (lit !== e.flickering) {
      e.flickering = lit;
      e.el.classList.toggle("is-flicker", lit);
    }
  });
  if (entries.size === 0) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function register(el: HTMLElement): () => void {
  const entry: Entry = { el, flickering: false };
  entries.add(entry);
  if (!raf && typeof window !== "undefined") raf = requestAnimationFrame(loop);
  return () => {
    entries.delete(entry);
  };
}

export function NeonText({
  children,
  tone = "accent",
  className,
}: {
  children: React.ReactNode;
  /** Glow color: primary accent (red) or secondary accent2 (yellow). */
  tone?: "accent" | "accent2";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(el);
  }, []);
  return (
    <span
      ref={ref}
      className={`smash-neon-reveal${tone === "accent2" ? " tone2" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </span>
  );
}
