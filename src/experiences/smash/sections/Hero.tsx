"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useTranslations } from "next-intl";
import { resolveHeroManifest } from "@/shared/hero/manifest";
import { useSiteConfig } from "@/shared/data/useMenu";
import { LayeredParallax } from "@/shared/hero/LayeredParallax";
import { Magnetic } from "@/shared/motion/primitives";
import { useSmashSfx, prefersReducedMotion } from "../motion";
import { useVelocitySkew } from "../scroll";
import { T, SKEW } from "../anim";
import { Stickers } from "./Stickers";

const HERO_ID = "smash-hero-stage";

/**
 * SMASH hero. Photoreal ingredient layers (manifest PNG/SVG planes) STAMP into
 * place one by one — each impact triggers screen-shake, a white flash and an
 * SFX thud, with neon edges + an RGB-split ghost over the photo. Once assembled
 * the stack lives inside LayeredParallax so scrolling separates the layers with
 * velocity-reactive skew (the page transforms, never just fades). Giant
 * bleeding type frames the stack; stickers are draggable on top.
 */
export function Hero() {
  const t = useTranslations("hero");
  const site = useSiteConfig();
  const manifest = resolveHeroManifest(site.hero);
  const layers = manifest.layers ?? [];

  const { playStamp } = useSmashSfx();
  const shake = useAnimationControls();
  const flash = useRef<HTMLDivElement>(null);
  const [assembled, setAssembled] = useState(0);
  const headingSkew = useVelocitySkew<HTMLHeadingElement>(
    SKEW.heading.factor,
    SKEW.heading.max,
  );

  // Drive the stamp sequence: each layer lands, fires shake + flash + sfx.
  useEffect(() => {
    const reduce = prefersReducedMotion();
    let cancelled = false;
    const timers: number[] = [];

    if (reduce) {
      // Defer the state write out of the synchronous effect body (no cascading
      // render) — instantly assembled, no stamp animation.
      const raf = requestAnimationFrame(() => setAssembled(layers.length));
      return () => cancelAnimationFrame(raf);
    }

    layers.forEach((_, i) => {
      const id = window.setTimeout(
        () => {
          if (cancelled) return;
          setAssembled(i + 1);
          playStamp();
          // screen-shake pulse
          void shake.start({
            x: [0, -6, 7, -4, 0],
            y: [0, 4, -5, 3, 0],
            transition: { duration: 0.26, ease: "easeOut" },
          });
          // flash pulse
          const f = flash.current;
          if (f) {
            f.style.animation = "none";
            // reflow to restart the CSS animation
            void f.offsetWidth;
            f.style.animation = "smash-flash 0.4s ease-out";
          }
        },
        500 + i * 220,
      );
      timers.push(id);
    });
    return () => {
      cancelled = true;
      timers.forEach((tt) => window.clearTimeout(tt));
    };
    // layers identity is stable for the placeholder manifest
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      data-act="hero"
      className="smash-grid-lines relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 pt-24"
    >
      {/* impact flash (stays outside the transforming stack so it covers the
          whole pinned frame on each stamp) */}
      <div
        ref={flash}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0"
      />

      {/* Everything that recedes during the scroll hand-off lives in one
          transform group so the exit reads as a single move. */}
      <div
        className="smash-hero-stack absolute inset-0 flex items-center justify-center px-4 pt-24"
        style={{ willChange: "transform, filter", filter: "brightness(1) blur(0px)" }}
      >
      {/* Giant bleeding type, behind/around the stack. A red ghost duplicate
          sits 1ch off for a permanent chromatic edge. */}
      <h1
        ref={headingSkew}
        aria-label={t("title")}
        className="smash-display smash-tight pointer-events-none absolute inset-x-0 top-[14%] z-10 text-center text-[22vw] uppercase"
        style={{ willChange: "transform" }}
      >
        <span aria-hidden className="smash-bleed relative block">
          <span
            aria-hidden
            className="absolute inset-0 block text-[var(--color-accent)] opacity-25"
            style={{ transform: "translate(0.06em, 0.02em)", WebkitTextStroke: "0" }}
          >
            {t("title")}
          </span>
          {t("title")}
        </span>
      </h1>

      {/* The stamping / parallax stack */}
      <motion.div
        id={HERO_ID}
        animate={shake}
        className="relative z-20 aspect-square w-[min(82vw,560px)]"
      >
        {/* Scroll-driven separation lives here; the inner planes fade/scale
            in as they "land" so the parallax owns post-assembly motion. */}
        <LayeredParallax manifest={manifest} explode={1.4} className="absolute inset-0" />

        {/* Stamp overlay: clones the layers and reveals them one by one with a
            slam-down transform + neon-tinted RGB ghost. Sits exactly on top of
            the parallax stack until assembly completes, then fades out so the
            parallax version takes over cleanly. */}
        {assembled < layers.length && (
          <div className="absolute inset-0">
            {layers.map((layer, i) => {
              const landed = i < assembled;
              return (
                <motion.div
                  key={layer.src}
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${layer.src})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: Math.round(layer.depth * 100),
                    filter:
                      "drop-shadow(0 0 calc(18px*var(--glow)) color-mix(in srgb,var(--color-accent) 70%,transparent))",
                  }}
                  initial={{ y: -120 - i * 30, scale: 1.25, opacity: 0 }}
                  animate={
                    landed
                      ? { y: 0, scale: 1, opacity: 1 }
                      : { y: -120 - i * 30, scale: 1.25, opacity: 0 }
                  }
                  transition={T.slam}
                />
              );
            })}
          </div>
        )}

        {/* RGB-split ghost of the whole stack — pure decoration, blends red */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage: `url(${manifest.still})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.25,
            filter:
              "drop-shadow(2px 0 0 var(--color-accent)) drop-shadow(-2px 0 0 var(--color-accent2))",
            animation: prefersReducedMotion()
              ? "none"
              : "smash-rgb 3.6s ease-in-out infinite",
          }}
        />

        {/* Draggable stickers, constrained to the stage */}
        <Stickers constraintsId={HERO_ID} />
      </motion.div>

      {/* Tagline + CTA, lower-left brutalist block */}
      <div className="absolute bottom-10 left-4 z-30 max-w-sm md:left-8">
        <p className="mb-4 max-w-xs text-sm uppercase leading-snug tracking-[0.18em] text-[var(--color-muted)]">
          {t("subtitle")}
        </p>
        <Magnetic strength={0.5} className="inline-block">
          <a
            href="#carta"
            className="smash-display smash-box-neon group/cta inline-flex items-center gap-3 bg-[var(--color-accent)] px-7 py-4 text-lg uppercase tracking-wide text-[var(--color-bg)] transition-[background,transform,box-shadow] duration-300 ease-[var(--ease-lux)] hover:-translate-y-0.5 hover:bg-[var(--color-accent2)]"
          >
            {t("cta")}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-[var(--ease-snap)] group-hover/cta:translate-x-1.5"
            >
              →
            </span>
          </a>
        </Magnetic>
      </div>

      {/* corner readout — live "REC" rig + address */}
      <div className="absolute right-4 top-24 z-30 hidden text-right text-[10px] uppercase leading-relaxed tracking-[0.3em] text-[var(--color-muted)] md:block">
        <span
          className="smash-neon text-[var(--color-accent)]"
          style={{ animation: prefersReducedMotion() ? "none" : "smash-blink 1.1s steps(1) infinite" }}
        >
          ●
        </span>{" "}
        REC
        <br />
        {site.address}
      </div>

      {/* scroll hint, centered low — fades as you leave via the stack transform */}
      <div className="absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)] md:flex">
        <span>{t("scrollHint")}</span>
        <span
          aria-hidden
          className="block h-8 w-px bg-[var(--color-accent)]"
          style={{ animation: prefersReducedMotion() ? "none" : "smash-scrollpulse 1.8s var(--ease-lux) infinite" }}
        />
      </div>
      </div>
    </section>
  );
}
