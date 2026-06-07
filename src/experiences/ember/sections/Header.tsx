"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { useExperience } from "@/experiences/ExperienceProvider";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * EMBER header — signed, minimal, with a hairline that fills as you scroll and
 * a backdrop that condenses from transparent to charred glass past the hero.
 * Driven imperatively in RAF (no re-render).
 */
export function Header() {
  const t = useTranslations("nav");
  const { meta } = useExperience();
  const barRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = getScroll().progress;
      const bar = barRef.current;
      if (bar) {
        const solid = Math.min(1, p * 8);
        bar.style.backgroundColor = `rgba(11,10,9,${(solid * 0.72).toFixed(3)})`;
        bar.style.backdropFilter = solid > 0.05 ? "blur(12px)" : "none";
        bar.style.borderColor = `rgba(168,154,133,${(solid * 0.14).toFixed(3)})`;
      }
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header
      ref={barRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link
          href="/"
          data-cursor="hover"
          className="text-2xl font-semibold tracking-[0.04em] text-[var(--color-text)]"
          style={{ fontFamily: "var(--display)" }}
        >
          {meta.brand}
        </Link>
        <nav
          className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] md:flex"
          style={{ fontFamily: "var(--body)" }}
        >
          <a href="#carta" data-cursor="hover" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]">
            {t("menu")}
          </a>
          <Link href="/galeria" data-cursor="hover" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]">
            {t("gallery")}
          </Link>
          <Link href="/probador" data-cursor="hover" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]">
            {t("preview")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ExperienceToggle />
          <LangSwitcher />
        </div>
      </div>
      <span
        ref={lineRef}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--color-accent)]"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
