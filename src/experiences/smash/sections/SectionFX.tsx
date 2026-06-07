"use client";

import { useEffect, useRef } from "react";

/**
 * (9 + 10) Section-change FX. When a [data-act] section scrolls into view it
 * gets a one-shot RGB-split/clip GLITCH (9) and a VHS scanline tear sweeps the
 * screen (10). The hero is skipped (it has its own slam entrance on load).
 */
export function SectionFX() {
  const vhsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vhs = vhsRef.current;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.2) continue;
          const el = e.target as HTMLElement;
          // Let the hero land on its own; don't double-glitch the first paint.
          if (el.dataset.act === "hero") continue;
          if (seen.has(el)) continue;
          seen.add(el);

          el.classList.remove("smash-fx-glitch");
          void el.offsetWidth; // restart
          el.classList.add("smash-fx-glitch");
          window.setTimeout(() => el.classList.remove("smash-fx-glitch"), 600);

          if (vhs) {
            vhs.classList.remove("run");
            void vhs.offsetWidth;
            vhs.classList.add("run");
          }
        }
      },
      { threshold: [0.2, 0.5] },
    );

    document
      .querySelectorAll<HTMLElement>("[data-act]")
      .forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return <div ref={vhsRef} className="smash-vhs" aria-hidden />;
}
