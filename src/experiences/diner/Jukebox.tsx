"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/shared/motion/easings";

// Diner jukebox — a spinning 45 with a neon halo. Tapping "play" spins the
// record and fires a short retro blip via Howler (respects the global mute bus
// set by the shared SoundToggle, so it stays silent until the user opts in).
// No audio assets invented: the blip is a tiny synthesized WAV data-URI.

// Minimal 8-bit-ish square blip, ~0.12s @ 8kHz mono. Deliberately tiny.
function makeBlipWav(): string {
  const sr = 8000;
  const len = Math.floor(sr * 0.12);
  const data = new Uint8Array(44 + len);
  const view = new DataView(data.buffer);
  const wstr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) data[o + i] = s.charCodeAt(i);
  };
  wstr(0, "RIFF");
  view.setUint32(4, 36 + len, true);
  wstr(8, "WAVE");
  wstr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  wstr(36, "data");
  view.setUint32(40, len, true);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = 1 - i / len;
    // Two-tone retro arpeggio.
    const f = t < 0.06 ? 660 : 880;
    const s = Math.sign(Math.sin(2 * Math.PI * f * t)) * env;
    data[44 + i] = 128 + Math.round(s * 70);
  }
  let bin = "";
  for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]!);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const TRACKS = ["Side A · Open Road", "Side B · Neon Mile", "Side C · Last Call"];

export function Jukebox({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const howlRef = useRef<import("howler").Howl | null>(null);

  useEffect(() => {
    let disposed = false;
    import("howler").then(({ Howl }) => {
      if (disposed) return;
      howlRef.current = new Howl({
        src: [makeBlipWav()],
        volume: 0.25,
        format: ["wav"],
      });
    });
    return () => {
      disposed = true;
      howlRef.current?.unload();
      howlRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    setPlaying((prev) => {
      const next = !prev;
      if (next) {
        howlRef.current?.play();
        setTrack((t) => (t + 1) % TRACKS.length);
      }
      return next;
    });
  }, []);

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {/* Vinyl */}
      <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
            opacity: playing ? 0.9 : 0,
            filter: "blur(8px)",
          }}
        />
        <motion.div
          className="relative h-full w-full rounded-full"
          style={{
            background:
              "repeating-radial-gradient(circle at center, #14110E 0 2px, #1d1813 2px 4px)",
            boxShadow:
              "inset 0 0 0 2px color-mix(in srgb, var(--color-text) 30%, transparent), 0 10px 26px -10px rgba(0,0,0,0.55)",
          }}
          animate={reduce ? {} : { rotate: playing ? 360 : 0 }}
          transition={
            playing && !reduce
              ? { repeat: Infinity, ease: "linear", duration: 2.4 }
              : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {/* Label */}
          <div
            className="absolute left-1/2 top-1/2 grid h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[7px] font-extrabold uppercase tracking-tight text-[var(--color-surface)]"
            style={{ background: "var(--accent)" }}
          >
            RUTA 66
          </div>
          {/* Spindle */}
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-surface)]" />
        </motion.div>
      </div>

      {/* Controls + readout */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Jukebox
        </p>
        <p className="font-display text-xl leading-none">{TRACKS[track]}</p>
        <button
          type="button"
          role="switch"
          aria-checked={playing}
          aria-label={playing ? "Pausar jukebox" : "Reproducir jukebox"}
          onClick={toggle}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border-2 border-[var(--color-text)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text)] shadow-[3px_3px_0_var(--color-text)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          style={{ transitionTimingFunction: EASE.back }}
        >
          <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
          {playing ? "Sonando" : "Poner disco"}
        </button>
        <p className="text-[10px] text-[var(--color-muted)]">
          Activa el sonido en la cabecera para oírlo.
        </p>
      </div>
    </div>
  );
}
