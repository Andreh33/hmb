"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { EMBER_STORY } from "../theme";
import { onAct } from "../scroll";
import { clamp01 } from "../motion";

/**
 * Horizontal story tram (act with `horizontal: true`). ScrollFilm pins the
 * section and translates this — its first child track — laterally as you scroll
 * vertically, so the four beats slide past like film cells. The outer section
 * MUST keep this track as its single firstElementChild (ScrollFilm measures it).
 */
export function Story() {
  const locale = useLocale() as Locale;
  const trackRef = useRef<HTMLDivElement>(null);

  // As the tram travels, the big ghost numerals counter-drift and each beat's
  // copy gains focus when it's centred — orchestrated against the act, not just
  // CSS-on-enter. Numbers are read off [data-ghost] / [data-beat] children so
  // we never re-render per frame.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ghosts = track.querySelectorAll<HTMLElement>("[data-ghost]");
    const beats = track.querySelectorAll<HTMLElement>("[data-beat]");
    const total = beats.length;
    return onAct("story", (p) => {
      // p is 0..1 across the whole horizontal travel.
      ghosts.forEach((g, i) => {
        // Each ghost numeral parallaxes opposite the travel for depth.
        g.style.transform = `translateX(${((p - i / Math.max(1, total)) * -40).toFixed(1)}px)`;
      });
      beats.forEach((b, i) => {
        // Distance of this beat's slot from the current read position.
        const slot = total > 1 ? i / (total - 1) : 0;
        const focus = 1 - clamp01(Math.abs(p - slot) * 2.2);
        b.style.opacity = String(0.35 + focus * 0.65);
      });
    });
  }, []);

  return (
    <div ref={trackRef} className="flex h-screen w-max items-center will-change-transform">
      {/* Intro panel */}
      <div className="flex h-screen w-screen flex-none flex-col justify-center px-8 md:px-24">
        <p
          className="mb-4 text-xs uppercase tracking-[0.42em] text-[var(--color-accent)]"
          style={{ fontFamily: "var(--body)" }}
        >
          El método
        </p>
        <h2
          className="max-w-2xl text-6xl font-semibold leading-[0.88] tracking-tight text-[var(--color-text)] md:text-8xl"
          style={{ fontFamily: "var(--display)" }}
        >
          Todo
          <br />
          empieza
          <br />
          en la brasa.
        </h2>
        <p className="mt-8 text-sm text-[var(--color-muted)]">
          Desliza para recorrer →
        </p>
      </div>

      {EMBER_STORY.map((beat, i) => (
        <article
          key={i}
          className="relative flex h-screen w-[88vw] flex-none flex-col justify-center border-l border-[var(--color-muted)]/15 px-8 md:w-[60vw] md:px-20"
        >
          <span
            data-ghost
            className="absolute right-6 top-[18vh] text-[18vw] font-semibold leading-none text-[var(--color-accent)]/8 will-change-transform md:text-[12vw]"
            style={{ fontFamily: "var(--display)" }}
            aria-hidden
          >
            0{i + 1}
          </span>
          <div data-beat className="will-change-[opacity]" style={{ opacity: 0.35 }}>
            <p
              className="mb-5 text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]"
              style={{ fontFamily: "var(--body)" }}
            >
              {beat.kicker[locale]}
            </p>
            <p
              className="max-w-xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-text)] md:text-6xl"
              style={{ fontFamily: "var(--display)" }}
            >
              {beat.line[locale]}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
