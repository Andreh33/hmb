"use client";

import { gsap } from "gsap";
import type { ScrollAct } from "@/shared/scroll/ScrollFilm";

/**
 * PRIME storyboard. Clean scroll-scrub, no pinning — the museum reads as a
 * continuous editorial spread. Each act lays a restrained scrubbed timeline:
 * the section's heading rises and its hairline rule draws in as it enters, so
 * the page TRANSFORMS on scroll rather than fading. Parallax/morphs on text are
 * handled by the motion primitives (VariableMorphText, Parallax) per section.
 *
 * Order MUST match the data-act order rendered in index.tsx:
 *   hero, manifesto, menu, story, location, footer.
 */

/** A draw-in for a section's top rule + a gentle lift of its first heading. */
function editorialEnter(selector: string) {
  return (tl: gsap.core.Timeline) => {
    const section = (tl.scrollTrigger?.trigger as HTMLElement | undefined) ?? null;
    if (!section) return;
    const heading = section.querySelector<HTMLElement>(selector);
    if (heading) {
      tl.fromTo(
        heading,
        { yPercent: 8, opacity: 0.55 },
        { yPercent: 0, opacity: 1, ease: "none" },
        0,
      );
    }
  };
}

export function buildPrimeActs(): ScrollAct[] {
  return [
    // I — Hero. The scene drives its own intro; nothing to scrub here.
    { id: "hero", build: () => {} },

    // II — Manifesto. Heading lifts as the serif morphs (handled by component).
    { id: "manifesto", build: editorialEnter("h2") },

    // III — Carte. Ledger heading lifts on entry.
    { id: "menu", build: editorialEnter("h2") },

    // IV — Story.
    { id: "story", build: editorialEnter("p") },

    // V — Location.
    { id: "location", build: editorialEnter("p") },

    // Footer.
    { id: "footer", build: () => {} },
  ];
}
