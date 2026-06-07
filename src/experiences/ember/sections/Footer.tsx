"use client";

import { Link } from "@/i18n/navigation";
import { useSiteConfig } from "@/shared/data/useMenu";
import { KineticMarquee, Magnetic } from "@/shared/motion/primitives";
import { HERO_HEADLINE } from "../theme";

/**
 * EMBER footer — a giant kinetic brand marquee glowing over the dark, then the
 * legal/contact row. The marquee skews with scroll velocity for kinetic life.
 */
export function Footer() {
  const site = useSiteConfig();
  return (
    <footer className="relative overflow-hidden border-t border-[var(--color-muted)]/12 bg-[var(--color-bg)] pt-20">
      <KineticMarquee
        className="select-none py-6 text-[var(--color-accent)]/15"
        speed={40}
        velocityFactor={0.8}
      >
        <span
          className="px-6 text-[16vw] font-semibold leading-none md:text-[12vw]"
          style={{ fontFamily: "var(--display)" }}
        >
          {HERO_HEADLINE.join(" ")} · {site.brand} ·
        </span>
      </KineticMarquee>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-14 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className="text-4xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--display)" }}
            >
              {site.brand}
            </span>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
              {site.address}
            </p>
          </div>
          <Magnetic strength={0.4}>
            <a
              href={`https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[var(--radius)] border border-[var(--color-accent)]/50 px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-[var(--color-text)] transition-colors duration-500 hover:text-[var(--color-bg)]"
              style={{ fontFamily: "var(--body)" }}
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
              <span className="relative">Reservar / Pedir</span>
              <span className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                →
              </span>
            </a>
          </Magnetic>
        </div>
        <nav className="flex flex-wrap gap-5 border-t border-[var(--color-muted)]/12 pt-6 text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
          <Link href="/aviso-legal" data-cursor="hover" className="hover:text-[var(--color-accent)]">
            Aviso legal
          </Link>
          <Link href="/privacidad" data-cursor="hover" className="hover:text-[var(--color-accent)]">
            Privacidad
          </Link>
          <Link href="/cookies" data-cursor="hover" className="hover:text-[var(--color-accent)]">
            Cookies
          </Link>
        </nav>
      </div>
    </footer>
  );
}
