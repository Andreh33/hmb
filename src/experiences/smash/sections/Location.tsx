"use client";

import { useTranslations } from "next-intl";
import { useSiteConfig } from "@/shared/data/useMenu";
import { Magnetic } from "@/shared/motion/primitives";

/**
 * SMASH ubicación — a brutalist contact slab. Hard neon-bordered panel with the
 * real mock address + hours (no invented data), a maps deep-link and a magnetic
 * directions button. The whole block sits as one bold rectangle against the bg.
 */
export function Location() {
  const t = useTranslations("location");
  const site = useSiteConfig();
  const maps = `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`;

  return (
    <section
      id="ubicacion"
      data-act="location"
      className="relative w-full px-4 py-28 md:py-36"
    >
      <div className="smash-box-neon mx-auto grid max-w-6xl gap-0 border-2 border-[var(--color-text)] bg-[var(--color-surface)] transition-transform duration-500 ease-[var(--ease-lux)] hover:-translate-y-1 md:grid-cols-2">
        <div className="border-b-2 border-[var(--color-text)] p-8 md:border-b-0 md:border-r-2 md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h2 className="smash-display smash-tight text-[clamp(2.2rem,5vw,4rem)] uppercase leading-[0.85]">
            {t("title")}
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">{t("subtitle")}</p>

          <p className="smash-display mt-10 text-2xl">{site.address}</p>
          <Magnetic strength={0.5} className="mt-6 inline-block">
            <a
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              className="smash-display group/dir inline-flex items-center gap-2 bg-[var(--color-accent)] px-6 py-3 text-sm uppercase tracking-widest text-[var(--color-bg)] transition-[background,transform] duration-300 ease-[var(--ease-lux)] hover:-translate-y-0.5 hover:bg-[var(--color-accent2)]"
            >
              {t("getDirections")}{" "}
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 ease-[var(--ease-snap)] group-hover/dir:translate-x-0.5 group-hover/dir:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
          </Magnetic>
        </div>

        <div className="p-8 md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[var(--color-accent2)]">
            {t("hours")}
          </p>
          <ul className="divide-y-2 divide-[var(--smash-line-strong)]">
            {Object.entries(site.hours).map(([day, hrs]) => (
              <li
                key={day}
                className="group/row flex items-center justify-between py-3 text-sm uppercase tracking-wide transition-colors duration-200 ease-[var(--ease-snap)] hover:text-[var(--color-accent)]"
              >
                <span className="text-[var(--color-muted)] transition-colors duration-200 group-hover/row:text-[var(--color-text)]">
                  {day}
                </span>
                <span className="smash-display tabular-nums">{hrs}</span>
              </li>
            ))}
          </ul>
          <p className="smash-display mt-8 text-sm uppercase tracking-widest">
            {t("phone")}:{" "}
            <a
              href={`tel:${site.whatsapp}`}
              className="text-[var(--color-accent)] hover:underline"
            >
              {site.whatsapp}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
