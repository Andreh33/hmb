"use client";

import { useEffect, useState } from "react";

/**
 * (47) SMASH preloader. A 0→100 counter races up, the SMASH wordmark stamps in,
 * then the whole curtain lifts away to reveal the page. Shows once per session.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [lift, setLift] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("smash_preloaded")) {
      const r = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(r);
    }
    let n = 0;
    const id = window.setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 11) + 4);
      setPct(n);
      if (n >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => setLift(true), 380);
        window.setTimeout(() => {
          sessionStorage.setItem("smash_preloaded", "1");
          setDone(true);
        }, 1120);
      }
    }, 95);
    return () => window.clearInterval(id);
  }, []);

  if (done) return null;

  return (
    <div className={`smash-preloader${lift ? " lift" : ""}`} aria-hidden>
      <div
        className="smash-display smash-neon smash-neon-live text-[var(--color-accent)]"
        style={{
          fontSize: "clamp(3rem,15vw,12rem)",
          lineHeight: 0.8,
          animation: "smash-preload-stamp 0.5s cubic-bezier(.85,0,.15,1) both",
        }}
      >
        SMASH
      </div>
      <div
        className="smash-display mt-6 tabular-nums text-[var(--color-text)]"
        style={{ fontSize: "clamp(1.2rem,4vw,2rem)", letterSpacing: "0.3em" }}
      >
        {String(pct).padStart(3, "0")}
      </div>
      <div className="mt-5 h-[3px] w-[min(60vw,420px)] overflow-hidden bg-[var(--color-surface)]">
        <div
          className="h-full bg-[var(--color-accent)]"
          style={{
            width: `${pct}%`,
            transition: "width 0.18s linear",
            boxShadow: "0 0 14px var(--color-accent)",
          }}
        />
      </div>
    </div>
  );
}
