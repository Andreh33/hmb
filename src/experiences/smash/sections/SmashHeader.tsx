"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import { useExperience } from "@/experiences/ExperienceProvider";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { SoundToggle } from "@/shared/ui/SoundToggle";

/**
 * SMASH header — brutalist top rail: hard-bordered wordmark with hover-glitch,
 * monospace-ish nav, then the shared controls (experience toggle, language,
 * sound mute). Distinct from the shared SiteHeader.
 */
export function SmashHeader() {
  const t = useTranslations("nav");
  const { meta } = useExperience();
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 border-b-2 border-[var(--color-text)] bg-[var(--color-bg)]/80 px-4 py-3 backdrop-blur-md">
      <Link
        href="/"
        className="smash-display smash-glitch text-2xl uppercase leading-none text-[var(--color-text)]"
        data-text={meta.brand}
      >
        {meta.brand}
      </Link>

      <nav className="hidden items-center gap-7 text-xs font-medium uppercase tracking-[0.25em] md:flex">
        <a href="#carta" className="smash-navlink">
          {t("menu")}
        </a>
        <a href="#historia" className="smash-navlink">
          {t("story")}
        </a>
        <a href="#ubicacion" className="smash-navlink">
          {t("location")}
        </a>
      </nav>

      <div className="flex items-center gap-2">
        <SoundToggle />
        <ExperienceToggle />
        <LangSwitcher />
      </div>
    </header>
  );
}
