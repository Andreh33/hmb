"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

/**
 * Ambient sound toggle. Lazily builds a tiny synthesized "tick" via Howler from
 * an inline WAV data-URI (no asset needed) and mutes/unmutes the global Howler
 * bus. Persists preference in localStorage. Accessible switch semantics.
 */
const TICK_WAV =
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export function SoundToggle({ className = "" }: { className?: string }) {
  // Starts muted on the server/first paint (hydration-safe); syncs from the
  // saved preference and the Howler bus once mounted.
  const [on, setOn] = useState(false);
  const tick = useRef<Howl | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sear_sound") === "on";
    Howler.mute(!saved);
    tick.current = new Howl({ src: [TICK_WAV], volume: 0.3, format: ["wav"] });
    // Defer the state sync out of the synchronous effect body to avoid a
    // cascading render warning while staying hydration-safe.
    const raf = requestAnimationFrame(() => setOn(saved));
    return () => {
      cancelAnimationFrame(raf);
      tick.current?.unload();
    };
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      Howler.mute(!next);
      localStorage.setItem("sear_sound", next ? "on" : "off");
      if (next) tick.current?.play();
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Silenciar sonido" : "Activar sonido"}
      onClick={toggle}
      className={`group inline-flex items-center gap-2 rounded-full border border-[var(--color-muted)]/25 bg-[var(--color-surface)]/70 px-3 py-1.5 text-xs uppercase tracking-widest outline-none backdrop-blur transition focus-visible:ring-2 focus-visible:ring-[var(--color-text)] ${className}`}
    >
      <span className="flex h-3 items-end gap-0.5" aria-hidden>
        {[0.5, 1, 0.7, 1.2].map((h, i) => (
          <span
            key={i}
            className="w-0.5 rounded-full bg-[var(--color-accent)] transition-all"
            style={{
              height: on ? `${h * 8}px` : "2px",
              animation: on ? `sear-eq 0.8s ${i * 0.12}s ease-in-out infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      {on ? "Sonido" : "Mudo"}
      <style>{`@keyframes sear-eq{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}`}</style>
    </button>
  );
}
