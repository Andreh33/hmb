"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollFilm, type ScrollAct } from "@/shared/scroll/ScrollFilm";
import { OrderBar } from "@/shared/convert/OrderBar";
import { SmashStyle } from "./style";
import { SmashHeader } from "./sections/SmashHeader";
import { Hero } from "./sections/Hero";
import { MenuWall } from "./sections/MenuWall";
import { Story } from "./sections/Story";
import { Location } from "./sections/Location";
import { SmashFooter } from "./sections/Footer";
import { NeonBlob } from "./sections/NeonBlob";
import { Atmosphere } from "./sections/Atmosphere";
import { Ticker } from "./sections/Ticker";
import { Preloader } from "./sections/Preloader";
import { SectionFX } from "./sections/SectionFX";

/**
 * SMASH — Brutalist Neon Kinetic.
 *
 * A bespoke composition (NOT the shared ExperienceShell): own self-hosted type
 * (Clash Display + Satoshi), a stamping/parallax hero, a brutalist price-wall
 * carta, a neon manifesto, a contact slab and a morphing footer — stitched with
 * velocity-reactive tickers, a difference-blend cursor blob and the shared
 * conversion OrderBar. ScrollFilm pins each act so the page TRANSFORMS as you
 * scroll (glitch-skew on entry, no plain fades).
 *
 * Acts map 1:1, in DOM order, to the [data-act] sections below. Tickers carry
 * no data-act so ScrollFilm ignores them.
 */
export default function SmashExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  // (13) Screen-shake the whole experience when something is added to the cart.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onShake = () => {
      root.classList.remove("is-shake");
      void root.offsetWidth; // restart the animation
      root.classList.add("is-shake");
      window.setTimeout(() => root.classList.remove("is-shake"), 420);
    };
    window.addEventListener("smash:shake", onShake);
    return () => window.removeEventListener("smash:shake", onShake);
  }, []);

  const acts: ScrollAct[] = useMemo(
    () => [
      {
        id: "hero",
        pin: true,
        distance: "+=90%",
        build: (tl: gsap.core.Timeline) => {
          // Cinematic hand-off: the hero content sinks, shrinks, dims and
          // softens (rack-focus blur) as it pushes back into the room while the
          // grid stays fixed on the pinned frame — the exit is staged as
          // carefully as the stamp entrance. We transform an inner wrapper, not
          // the pinned section, so the pin never fights the scale/blur.
          tl.to(
            "[data-act='hero'] .smash-hero-content",
            {
              yPercent: -18,
              scale: 0.94,
              opacity: 0.2,
              filter: "blur(4px)",
              ease: "none",
            },
            0,
          );
        },
      },
      {
        id: "menu",
        // Material lean-in: the wall arrives skewed + dim then settles square,
        // as if the whole slab swings into the light.
        build: (tl: gsap.core.Timeline) => {
          tl.from(
            "[data-act='menu']",
            {
              skewY: 3.5,
              yPercent: 4,
              opacity: 0.35,
              filter: "brightness(0.5)",
              ease: "none",
            },
            0,
          );
        },
      },
      {
        id: "story",
        build: (tl: gsap.core.Timeline) => {
          // Slides in laterally with a faint grid drift so the bg moves at a
          // different rate from the type (the page transforms, not fades).
          tl.from(
            "[data-act='story']",
            { xPercent: -4, skewX: 1.5, opacity: 0.4, ease: "none" },
            0,
          );
        },
      },
      {
        id: "location",
        build: (tl: gsap.core.Timeline) => {
          tl.from(
            "[data-act='location']",
            { skewX: -2.5, yPercent: 3, opacity: 0.45, ease: "none" },
            0,
          );
        },
      },
      {
        id: "footer",
        build: () => {
          /* footer morphs via VariableMorphText on scroll; no timeline. */
        },
      },
    ],
    [],
  );

  return (
    <div ref={rootRef} className="smash-root relative min-h-screen">
      <SmashStyle />
      <Preloader />
      <SectionFX />
      <Atmosphere />
      <NeonBlob />
      <SmashHeader />

      <ScrollFilm acts={acts}>
        <main className="relative z-10">
          <Hero />
          <Ticker direction="left" tone="accent" />
          <MenuWall />
          <Ticker direction="right" tone="accent2" />
          <Story />
          <Location />
          <Ticker direction="left" tone="accent" />
          <SmashFooter />
        </main>
      </ScrollFilm>

      <OrderBar />
    </div>
  );
}
