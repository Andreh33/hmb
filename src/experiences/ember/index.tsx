"use client";

import { useMemo } from "react";
import { resolveHeroManifest, type HeroManifest } from "@/shared/hero/manifest";
import { useSiteConfig } from "@/shared/data/useMenu";
import { ScrollFilm, type ScrollAct } from "@/shared/scroll/ScrollFilm";
import { OrderBar } from "@/shared/convert/OrderBar";
import { HERO_FRAME_COUNT } from "./theme";
import { setActProgress } from "./scroll";

import { Preload } from "./sections/Preload";
import { Header } from "./sections/Header";
import { Hero } from "./Hero";
import { SparkCursor } from "./SparkCursor";
import { Atmosphere } from "./Atmosphere";
import { Ingredients } from "./sections/Ingredients";
import { Morph } from "./sections/Morph";
import { Menu } from "./sections/Menu";
import { Story } from "./sections/Story";
import { Location } from "./sections/Location";
import { Footer } from "./sections/Footer";

/**
 * EMBER — Cinematic Dark Gourmet. A signed, distinctive composition (NOT the
 * shared shell). Storyboard §7.4 wired through ScrollFilm; each pinned act
 * publishes its precise progress to the EMBER scroll bus so the canvas
 * frame-scrub, glaze, sparks and SVG draws scrub against the *act* — the page
 * TRANSFORMS as you scroll rather than fading in.
 *
 * Acts (document order of [data-act] === acts[] order):
 *   0 montage      — pin: hero burger assembles + glaze + headline ignites
 *   1 ingredients  — pin: stage rotates, leader lines draw, labels resolve
 *   2 morph        — pin: assembled burger travels + contracts into the carta
 *   3 story        — horizontal: four method beats slide laterally
 *   4 location     — pin: route draws, pin drops, counters tick
 */
export default function EmberExperience() {
  const site = useSiteConfig();

  // Prefer real frames; fall back to the layered placeholder assembly.
  const manifest: HeroManifest = useMemo(() => {
    const base = resolveHeroManifest(site.hero);
    // If a client dropped a frame sequence, honour it; else keep layered.
    return base.frames
      ? { ...base, mode: "frames", frames: { ...base.frames, count: base.frames.count || HERO_FRAME_COUNT } }
      : base;
  }, [site.hero]);

  const acts: ScrollAct[] = useMemo(
    () => [
      {
        id: "montage",
        pin: true,
        distance: "+=160%",
        onProgress: (p) => setActProgress("montage", p),
        build: () => {},
      },
      {
        id: "ingredients",
        pin: true,
        distance: "+=150%",
        onProgress: (p) => setActProgress("ingredients", p),
        build: () => {},
      },
      {
        id: "morph",
        pin: true,
        distance: "+=120%",
        onProgress: (p) => setActProgress("morph", p),
        build: () => {},
      },
      {
        id: "story",
        horizontal: true,
        onProgress: (p) => setActProgress("story", p),
        build: () => {},
      },
      {
        id: "location",
        pin: true,
        distance: "+=120%",
        onProgress: (p) => setActProgress("location", p),
        build: () => {},
      },
    ],
    [],
  );

  return (
    <main className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Preload />
      <Header />
      <SparkCursor />
      <Atmosphere />

      <ScrollFilm acts={acts}>
        {/* 0 — Montage (hero) */}
        <section data-act="montage" className="relative h-screen w-full">
          <Hero manifest={manifest} />
        </section>

        {/* 1 — Ingredients */}
        <section data-act="ingredients" className="relative h-screen w-full">
          <Ingredients manifest={manifest} />
        </section>

        {/* 2 — Morph → Carta */}
        <section data-act="morph" className="relative h-screen w-full">
          <Morph manifest={manifest} />
        </section>

        {/* Carta (interactive, static layout) */}
        <Menu />

        {/* 3 — Story (horizontal) */}
        <section
          data-act="story"
          className="relative h-screen w-full overflow-hidden"
        >
          <Story />
        </section>

        {/* 4 — Location */}
        <section data-act="location" className="relative h-screen w-full">
          <Location />
        </section>

        {/* Footer + conversion */}
        <Footer />
      </ScrollFilm>

      <OrderBar />
    </main>
  );
}
