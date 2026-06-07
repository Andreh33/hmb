"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { useTier } from "@/shared/perf/Capability";
import { FxCanvas } from "@/shared/fx";
import { resolveHeroManifest } from "@/shared/hero/manifest";
import { useSiteConfig } from "@/shared/data/useMenu";
import { EASE_ARR } from "@/shared/motion/easings";
import { primeArt } from "../art";
import { LABEL_TRACK, MEASURE, RULE } from "../theme";

// Heavy R3F scene — lazy, browser-only.
const PrimeHeroScene = dynamic(
  () => import("./PrimeHeroScene").then((m) => m.PrimeHeroScene),
  { ssr: false },
);

/**
 * PRIME hero — a single editorial plate. The photo is rendered in brand
 * duotone and revealed by a liquid displacement wash; on full tier a GPU fluid
 * glaze tracks the cursor. Type sits over it like a magazine cover: a wide-set
 * eyebrow, a towering Cormorant headline split across hairline rules, and a
 * restrained CTA. Hero is STILL — it does not fade in, it materializes.
 */
export function PrimeHero() {
  const t = useTranslations("hero");
  const { meta } = useExperience();
  const tier = useTier();
  const site = useSiteConfig();

  const art = primeArt(meta.colors);
  const manifest = resolveHeroManifest(site.hero);
  const introRef = useRef(0);

  const canvas = tier.canvas3d;
  const fluid = tier.fluid;

  return (
    <section
      id="prime-hero"
      data-act="hero"
      className="relative flex h-[100svh] w-full items-end overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* WebGL plate (full/medio) or DOM duotone fallback (lite) */}
      <div className="absolute inset-0">
        {canvas ? (
          <FxCanvas
            camera={{ fov: 35, position: [0, 0, 5] }}
            dprRange={[1, tier.maxDpr]}
            fallback={<HeroFallback src={manifest.still} />}
          >
            <PrimeHeroScene
              src={manifest.still}
              art={art}
              fluid={fluid}
              introRef={introRef}
            />
          </FxCanvas>
        ) : (
          <HeroFallback src={manifest.still} />
        )}
        {/* Editorial vignette + paper warmth so the type always reads. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--color-bg) 88%, transparent) 0%, transparent 42%), radial-gradient(120% 80% at 50% 110%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 60%)",
          }}
        />
      </div>

      {/* Type layer */}
      <div
        className="relative z-10 mx-auto w-full pb-[clamp(2.5rem,6vh,5rem)]"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <div className="relative mb-7 flex items-center gap-5 pt-[1.1rem]">
          {/* Hairline that draws across on entry — the page setting its rule. */}
          <motion.span
            aria-hidden
            className="absolute left-0 top-0 block h-px origin-left bg-[color-mix(in_srgb,var(--color-text)_16%,transparent)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE_ARR.lux, delay: 0.1 }}
            style={{ width: "100%" }}
          />
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_ARR.lux, delay: 0.2 }}
            className="text-[0.72rem] uppercase text-[var(--color-muted)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            {t("eyebrow")}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="ml-auto text-[0.72rem] uppercase text-[var(--color-muted)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            {meta.tagline}
          </motion.span>
        </div>

        <h1
          className="font-display text-[var(--color-text)]"
          style={{
            fontSize: "clamp(3.5rem, 13vw, 12rem)",
            lineHeight: 0.86,
            letterSpacing: "-0.015em",
            fontWeight: 300,
          }}
        >
          <MaskLine delay={0.35}>{t("titleLine1")}</MaskLine>
          <MaskLine delay={0.5}>
            <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>
              {t("titleLine2")}
            </em>
          </MaskLine>
          <MaskLine delay={0.65}>{t("titleLine3")}</MaskLine>
        </h1>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_ARR.lux, delay: 0.9 }}
            className="max-w-[42ch] text-base text-[var(--color-muted)] md:text-lg"
          >
            {t("subtitle")}
          </motion.p>
          <motion.a
            href="#carta"
            data-cursor="hover"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_ARR.lux, delay: 1 }}
            className="group inline-flex items-center gap-4 self-start text-sm uppercase text-[var(--color-text)] md:self-auto"
            style={{ letterSpacing: "0.18em" }}
          >
            <span
              className="transition-colors group-hover:text-[var(--color-accent)]"
              style={{ borderBottom: RULE, paddingBottom: "0.35rem" }}
            >
              {t("cta")}
            </span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
            >
              →
            </span>
          </motion.a>
        </div>
      </div>

      {/* Scroll cue — a hairline that fills downward on a slow loop. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-6 right-[clamp(1.25rem,4vw,3rem)] z-10 hidden items-center gap-3 text-[0.7rem] uppercase text-[var(--color-muted)] md:flex"
        style={{ letterSpacing: LABEL_TRACK }}
      >
        {t("scrollHint")}
        <span className="relative block h-10 w-px overflow-hidden bg-[var(--color-muted)]/25">
          <motion.span
            className="absolute inset-x-0 top-0 block h-3 bg-[var(--color-accent)]"
            animate={{ y: ["-100%", "340%"] }}
            transition={{
              duration: 2.1,
              ease: EASE_ARR.soft,
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          />
        </span>
      </motion.div>
    </section>
  );
}

/** A headline line that wipes up from behind a clip mask (materialize, no fade). */
function MaskLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, ease: EASE_ARR.lux, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** DOM-only duotone plate for lite tier / Suspense fallback. Two stacked
 *  layers fake the shader duotone: a desaturated base, then a gilt gradient
 *  multiplied over it so it stays on-brand without WebGL. */
function HeroFallback({ src }: { src: string }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          filter: "grayscale(1) contrast(1.18) brightness(0.92)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-color"
        style={{
          background:
            "linear-gradient(150deg, var(--color-text) 0%, var(--color-accent) 78%, var(--color-accent2) 100%)",
          opacity: 0.92,
        }}
      />
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, transparent 30%, color-mix(in srgb, var(--color-text) 60%, transparent) 100%)",
        }}
      />
    </div>
  );
}
