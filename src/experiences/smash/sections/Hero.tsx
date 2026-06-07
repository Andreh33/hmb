"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useAnimationControls } from "motion/react";
import { useTranslations } from "next-intl";
import { resolveHeroManifest } from "@/shared/hero/manifest";
import { useSiteConfig } from "@/shared/data/useMenu";
import { getScroll } from "@/shared/scroll/scroll-store";
import { Magnetic } from "@/shared/motion/primitives";
import { useSmashSfx, prefersReducedMotion } from "../motion";
import { useVelocitySkew } from "../scroll";
import { SKEW } from "../anim";
import { Stickers } from "./Stickers";

const HERO_ID = "smash-hero-stage";

/**
 * SMASH hero. A real, photoreal burger fills the frame edge-to-edge. It SLAMS in
 * on load (scale-down + screen-shake + white flash + SFX thud), wears a neon
 * grade + RGB-split shimmer + CRT vignette, and drifts with a parallax/scale as
 * you scroll. The wordmark, tagline and CTA are stacked dead-centre over the
 * photo (no more left-hugging block). Stickers stay draggable on top.
 */
export function Hero() {
  const t = useTranslations("hero");
  const site = useSiteConfig();
  const manifest = resolveHeroManifest(site.hero);
  const photo = manifest.still;
  const focal = manifest.focal ?? [0.5, 0.5];

  const { playStamp } = useSmashSfx();
  const shake = useAnimationControls();
  const flash = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const headingSkew = useVelocitySkew<HTMLHeadingElement>(
    SKEW.heading.factor,
    SKEW.heading.max,
  );

  // The burger lands once: flash + screen-shake + thud, like a smash on the grill.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setTimeout(() => {
      playStamp();
      void shake.start({
        x: [0, -7, 8, -5, 0],
        y: [0, 5, -6, 3, 0],
        transition: { duration: 0.28, ease: "easeOut" },
      });
      const f = flash.current;
      if (f) {
        f.style.animation = "none";
        void f.offsetWidth; // reflow to restart
        f.style.animation = "smash-flash 0.45s ease-out";
      }
    }, 480);
    return () => window.clearTimeout(id);
  }, [playStamp, shake]);

  // Scroll parallax: the photo plate drifts up + scales slightly as you leave.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = getScroll().progress;
      const el = plate.current;
      if (el) {
        el.style.transform = `translate3d(0, ${(-p * 12).toFixed(2)}%, 0) scale(${(1 + p * 0.12).toFixed(3)})`;
      }
      // Scrim darkens the burger behind the headline at rest (text legible),
      // then fades out as you scroll and the burger comes forward.
      const sc = scrim.current;
      if (sc) {
        sc.style.opacity = (0.6 * Math.max(0, 1 - p / 0.32)).toFixed(3);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id={HERO_ID}
      data-act="hero"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      {/* ---------- Photoreal burger plate (parallax + entrance) ---------- */}
      <motion.div animate={shake} className="absolute inset-0 z-0">
        <div ref={plate} className="absolute inset-0 will-change-transform">
          <Image
            src={photo}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover smash-hero-in"
            style={{ objectPosition: `${focal[0] * 100}% ${focal[1] * 100}%` }}
          />
          {/* RGB-split shimmer of the same photo — pure chromatic decoration */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center mix-blend-screen"
            style={{
              backgroundImage: `url(${photo})`,
              backgroundPosition: `${focal[0] * 100}% ${focal[1] * 100}%`,
              opacity: 0.18,
              filter:
                "drop-shadow(3px 0 0 var(--color-accent)) drop-shadow(-3px 0 0 var(--color-accent2))",
              animation: prefersReducedMotion()
                ? "none"
                : "smash-rgb 4.2s ease-in-out infinite",
            }}
          />
        </div>
      </motion.div>

      {/* (4) Vapor / smoke rising off the burger. */}
      <div className="smash-vapor z-[7]" aria-hidden>
        <i style={{ left: "32%", ["--dur" as string]: "7s", ["--d" as string]: "0s", ["--dx" as string]: "-12%" }} />
        <i style={{ left: "48%", ["--dur" as string]: "8.5s", ["--d" as string]: "1.6s", ["--dx" as string]: "8%" }} />
        <i style={{ left: "62%", ["--dur" as string]: "6.5s", ["--d" as string]: "3.1s", ["--dx" as string]: "-6%" }} />
      </div>

      {/* ---------- Grade: legibility + neon mood (over the photo) ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, var(--color-bg) 2%, color-mix(in srgb, var(--color-bg) 55%, transparent) 30%, transparent 62%), radial-gradient(120% 100% at 50% 38%, transparent 46%, color-mix(in srgb, var(--color-bg) 78%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(60vmax 50vmax at 50% 90%, color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 70%)",
        }}
      />

      {/* (Home) Dark scrim over the burger, behind the text — keeps the headline
          legible at rest, fades out on scroll as the burger comes forward. */}
      <div
        ref={scrim}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: "var(--color-bg)", opacity: 0.6 }}
      />

      {/* impact flash */}
      <div
        ref={flash}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0"
      />

      {/* ---------- Centred content stack ---------- */}
      <div className="smash-hero-content relative z-30 flex flex-col items-center px-4 text-center" style={{ willChange: "transform, filter" }}>
        <p className="mb-5 text-xs uppercase tracking-[0.5em] text-[var(--color-accent)] md:text-sm">
          {site.brand} · {t("scrollHint")}
        </p>

        <h1
          ref={headingSkew}
          aria-label={t("title")}
          className="smash-display smash-tight smash-neon smash-neon-live relative text-[clamp(3.5rem,17vw,13rem)] uppercase text-[var(--color-text)]"
          style={{ willChange: "transform" }}
        >
          <span aria-hidden className="relative block">
            <span
              aria-hidden
              className="absolute inset-0 block text-[var(--color-accent)] opacity-30"
              style={{ transform: "translate(0.05em, 0.02em)" }}
            >
              {t("title")}
            </span>
            {t("title")}
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base uppercase leading-snug tracking-[0.14em] text-[var(--color-muted)] md:text-lg">
          {t("subtitle")}
        </p>

        <Magnetic strength={0.5} className="mt-9 inline-block">
          <a
            href="#carta"
            className="smash-display smash-box-neon group/cta inline-flex items-center gap-3 bg-[var(--color-accent)] px-9 py-4 text-lg uppercase tracking-wide text-[var(--color-bg)] transition-[background,transform,box-shadow] duration-300 ease-[var(--ease-lux)] hover:-translate-y-0.5 hover:bg-[var(--color-accent2)] md:text-xl"
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
          style={{
            animation: prefersReducedMotion()
              ? "none"
              : "smash-blink 1.1s steps(1) infinite",
          }}
        >
          ●
        </span>{" "}
        REC
        <br />
        {site.address}
      </div>

      {/* scroll hint, centered low */}
      <div className="absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)] md:flex">
        <span>{t("scrollHint")}</span>
        <span
          aria-hidden
          className="block h-8 w-px bg-[var(--color-accent)]"
          style={{
            animation: prefersReducedMotion()
              ? "none"
              : "smash-scrollpulse 1.8s var(--ease-lux) infinite",
          }}
        />
      </div>

      {/* Draggable neon stickers, constrained to the hero */}
      <Stickers constraintsId={HERO_ID} />
    </section>
  );
}
