"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useExperience } from "@/experiences/ExperienceProvider";
import { useSiteConfig } from "@/shared/data/useMenu";
import { VariableMorphText } from "@/shared/motion/primitives";

/**
 * SMASH footer — a colossal scroll-morphing wordmark that fills the band, with
 * a thin brutalist meta rail beneath (nav + legal). The brand stretches its
 * variable-font axes as the page bottom approaches.
 */
export function SmashFooter() {
  const t = useTranslations("footer");
  const { meta } = useExperience();
  const site = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer
      data-act="footer"
      className="relative w-full overflow-hidden border-t-2 border-[var(--color-text)] px-4 pb-10 pt-16"
    >
      <VariableMorphText
        driver="scroll"
        weight={[400, 700]}
        width={[80, 130]}
        className="smash-display smash-tight smash-neon smash-neon-live block w-full text-center text-[24vw] uppercase leading-[0.8] text-[var(--color-accent)]"
      >
        {meta.brand}
      </VariableMorphText>

      <p className="mt-6 text-center text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
        {t("tagline")}
      </p>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t-2 border-[var(--smash-line-strong)] pt-6 text-xs uppercase tracking-widest text-[var(--color-muted)] md:flex-row">
        <span>
          © {year} {site.brand}. {t("rights")}
        </span>
        <nav className="flex gap-5">
          <Link
            href="/privacidad"
            className="transition-colors duration-200 ease-[var(--ease-snap)] hover:text-[var(--color-accent)]"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/aviso-legal"
            className="transition-colors duration-200 ease-[var(--ease-snap)] hover:text-[var(--color-accent)]"
          >
            {t("terms")}
          </Link>
          <Link
            href="/cookies"
            className="transition-colors duration-200 ease-[var(--ease-snap)] hover:text-[var(--color-accent)]"
          >
            {t("cookies")}
          </Link>
        </nav>
        <span>{t("madeBy")}</span>
      </div>
    </footer>
  );
}
