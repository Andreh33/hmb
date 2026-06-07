"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useExperience } from "@/experiences/ExperienceProvider";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { getScroll } from "@/shared/scroll/scroll-store";
import { LABEL_TRACK, MEASURE, RULE_FAINT } from "../theme";

/**
 * PRIME header — a masthead, not a nav bar. Wordmark left, gallery index
 * center, controls right; a hairline rule beneath. The header lifts its paper
 * backing in only after you leave the hero, keeping the overture clean.
 */
export function PrimeHeader() {
  const t = useTranslations("nav");
  const { meta } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);

  // RAF watch: solidify the masthead once past the hero (progress-based).
  useEffect(() => {
    let raf = 0;
    let last = false;
    const tick = () => {
      const past = getScroll().progress > 0.06;
      if (past !== last) {
        last = past;
        setSolid(past);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-700"
      style={{
        borderBottom: solid ? RULE_FAINT : "1px solid transparent",
        backgroundColor: solid
          ? "color-mix(in srgb, var(--color-bg) 82%, transparent)"
          : "transparent",
        backdropFilter: solid ? "blur(10px)" : "none",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-6 py-4"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <Link
          href="/"
          data-cursor="hover"
          className="font-display text-2xl leading-none"
          style={{ letterSpacing: "0.04em", fontWeight: 500 }}
        >
          {meta.brand}
        </Link>

        <nav
          className="hidden items-center gap-8 text-[0.72rem] uppercase md:flex"
          style={{ letterSpacing: LABEL_TRACK }}
        >
          <a
            href="#carta"
            data-cursor="hover"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            {t("menu")}
          </a>
          <a
            href="#historia"
            data-cursor="hover"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            {t("story")}
          </a>
          <a
            href="#ubicacion"
            data-cursor="hover"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            {t("location")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ExperienceToggle />
          <LangSwitcher />
        </div>
      </div>
    </header>
  );
}
