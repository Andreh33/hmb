"use client";

import { useMemo } from "react";
import { gsap } from "gsap";
import { ExperienceShell } from "@/experiences/ExperienceShell";
import { ScrollFilm, type ScrollAct } from "@/shared/scroll/ScrollFilm";
import { Atmosphere } from "./Atmosphere";
import { DinerInterlude } from "./DinerInterlude";

// RUTA 66 (DINER) — Retro Americana + 2D physics. Hero stays a real image
// (manifest, layered). On top: a halftone/grain/bloom atmosphere, a matter.js
// ingredient-stacking play area, a "¿qué pido?" fortune wheel over real menu
// data, and a vinyl jukebox. Motion feel: bouncy (see registry → FEEL.bouncy).
//
// The page TRANSFORMS on scroll via ScrollFilm. The shell renders sections in
// the order [hero, kitchen, menu, story, location, footer]; the acts array
// pairs by index. We keep the choreography light (no aggressive pins) so the
// conversion-ready shell layout stays intact while gaining a scrubbed,
// road-trip cadence.
export default function DinerExperience() {
  const acts: ScrollAct[] = useMemo(
    () => [
      // hero — let the layered parallax breathe; settle the headline upward.
      {
        id: "hero",
        build: (tl) => {
          tl.fromTo(
            "[data-act='hero'] h1",
            { yPercent: 0 },
            { yPercent: -18, ease: "none" },
            0,
          );
        },
      },
      // kitchen — the play area rises and "snaps" into place with a slight
      // overshoot read (bouncy), then drifts as you pass through.
      {
        id: "kitchen",
        build: (tl) => {
          tl.fromTo(
            "[data-act='kitchen']",
            { backgroundPositionY: "0px" },
            { backgroundPositionY: "40px", ease: "none" },
            0,
          );
        },
      },
      // menu — scrubbed lift of the grid title for continuity.
      {
        id: "menu",
        build: (tl) => {
          tl.fromTo(
            "[data-act='menu'] h2",
            { y: 24, autoAlpha: 0.85 },
            { y: -12, autoAlpha: 1, ease: "none" },
            0,
          );
        },
      },
      // story
      {
        id: "story",
        build: (tl) => {
          tl.fromTo(
            "[data-act='story']",
            { y: 18 },
            { y: -18, ease: "none" },
            0,
          );
        },
      },
      // location
      {
        id: "location",
        build: (tl) => {
          tl.fromTo(
            "[data-act='location']",
            { y: 16 },
            { y: -16, ease: "none" },
            0,
          );
        },
      },
      // footer — gentle reveal as it enters.
      {
        id: "footer",
        build: (tl) => {
          tl.fromTo(
            "[data-act='footer'] > div",
            { y: 12, autoAlpha: 0.9 },
            { y: 0, autoAlpha: 1, ease: gsap.parseEase("power2.out") },
            0,
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <ScrollFilm acts={acts}>
        <ExperienceShell>
          <DinerInterlude />
        </ExperienceShell>
      </ScrollFilm>
      <Atmosphere />
    </>
  );
}
