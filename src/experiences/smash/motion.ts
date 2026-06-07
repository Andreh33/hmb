"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";

/**
 * Tiny synthesized SFX bank for SMASH. Routes through the GLOBAL Howler bus so
 * the shared <SoundToggle/> mute switch governs it (no separate volume state).
 * Sounds are inline WAV/short data URIs so no audio asset ships. The "stamp"
 * cue is a short low thud; "tick" a UI blip. Both respect Howler.mute().
 */
const STAMP_WAV =
  "data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YWAAAAAAAB8AVQB6AHwAVAANALb/Yf8j/wz/Hf9R/5z/8/9HAJEAxQDdANcAtgB+ADUA4f+L/zr/9P6//p/+lf6h/sP+8v4o/13+kf67/tz+9v4J/xf/I/8w/0H/Vv9w/4//";

const TICK_WAV =
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export function useSmashSfx() {
  const stamp = useRef<Howl | null>(null);
  const tick = useRef<Howl | null>(null);

  useEffect(() => {
    stamp.current = new Howl({ src: [STAMP_WAV], volume: 0.5, format: ["wav"] });
    tick.current = new Howl({ src: [TICK_WAV], volume: 0.25, format: ["wav"] });
    return () => {
      stamp.current?.unload();
      tick.current?.unload();
    };
  }, []);

  return {
    playStamp: () => {
      // Howler.mute() (driven by SoundToggle) gates output globally.
      stamp.current?.rate(0.85 + Math.random() * 0.3);
      stamp.current?.play();
    },
    playTick: () => tick.current?.play(),
  };
}

/** prefers-reduced-motion guard, SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
