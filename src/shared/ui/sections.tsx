"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/shared/motion/primitives";
import { useSiteConfig } from "@/shared/data/useMenu";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function StorySection() {
  const t = useTranslations("nav");
  return (
    <section
      id="historia"
      data-act="story"
      className="mx-auto w-full max-w-6xl px-5 py-24 md:py-32"
    >
      <Reveal>
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--color-accent)]">
          {t("story")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="max-w-3xl font-display text-3xl leading-tight md:text-5xl">
          Fuego, carne madurada y pan recién horneado. Nada más, nada menos.
        </p>
      </Reveal>
    </section>
  );
}

export function LocationSection() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const site = useSiteConfig();
  return (
    <section
      id="ubicacion"
      data-act="location"
      className="mx-auto w-full max-w-6xl px-5 py-24 md:py-32"
    >
      <Reveal>
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--color-accent)]">
          {t("location")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="font-display text-2xl md:text-4xl">{site.address}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <ul className="mt-6 space-y-1 text-[var(--color-muted)]">
          {Object.entries(site.hours).map(([day, hrs]) => (
            <li key={day}>
              <span className="uppercase">{day}</span> · {hrs}
            </li>
          ))}
        </ul>
      </Reveal>
      <p className="sr-only">{locale}</p>
    </section>
  );
}

export function SiteFooter() {
  const site = useSiteConfig();
  return (
    <footer
      data-act="footer"
      className="border-t border-[var(--color-muted)]/15 px-5 py-12"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="font-display text-3xl">{site.brand}</span>
        <nav className="flex gap-4 text-sm text-[var(--color-muted)]">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
