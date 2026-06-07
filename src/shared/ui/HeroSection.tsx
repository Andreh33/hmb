"use client";

import { useTranslations } from "next-intl";
import { HeroStage } from "@/shared/hero/HeroStage";
import { resolveHeroManifest } from "@/shared/hero/manifest";
import { SplitText } from "@/shared/motion/primitives";
import { useExperience } from "@/experiences/ExperienceProvider";
import { useSiteConfig } from "@/shared/data/useMenu";

export function HeroSection() {
  const t = useTranslations("hero");
  const { meta } = useExperience();
  const site = useSiteConfig();
  const manifest = resolveHeroManifest(site.hero);

  return (
    <section
      data-act="hero"
      className="relative flex h-[100svh] w-full items-end overflow-hidden"
    >
      <div className="absolute inset-0">
        <HeroStage
          manifest={manifest}
          prefer={meta.heroMode}
          glazeColor={meta.colors.glaze}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[var(--color-accent)]">
          {meta.tagline}
        </p>
        <h1 className="font-display text-6xl leading-[0.9] md:text-8xl lg:text-9xl">
          <SplitText text={site.brand} />
        </h1>
        <p className="mt-6 max-w-md text-[var(--color-muted)]">{t("scrollHint")}</p>
      </div>
    </section>
  );
}
