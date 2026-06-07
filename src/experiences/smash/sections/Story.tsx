"use client";

import { useTranslations } from "next-intl";
import { OutlineToFill } from "@/shared/motion/primitives";
import { useVelocitySkew } from "../scroll";
import { SKEW } from "../anim";

/**
 * SMASH historia — full-bleed neon manifesto. A giant outline-to-fill headline
 * floods on scroll, three hard-bordered pillars sit on the visible grid, and a
 * quote slab leans with scroll velocity.
 */
export function Story() {
  const t = useTranslations("story");
  const quoteSkew = useVelocitySkew<HTMLParagraphElement>(
    SKEW.quote.factor,
    SKEW.quote.max,
  );

  const pillars = [
    { title: t("pillar1Title"), body: t("pillar1Body") },
    { title: t("pillar2Title"), body: t("pillar2Body") },
    { title: t("pillar3Title"), body: t("pillar3Body") },
  ];

  return (
    <section
      id="historia"
      data-act="story"
      className="smash-grid-lines relative w-full overflow-hidden px-4 py-28 md:px-8 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
      <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[var(--color-accent)]">
        {t("eyebrow")}
      </p>

      <OutlineToFill
        text={t("title")}
        className="smash-display block max-w-5xl text-[clamp(2.5rem,7vw,6rem)] uppercase"
        fillColor="var(--color-accent)"
        strokeColor="var(--color-text)"
        strokeWidth={2}
      />

      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]">
        {t("body")}
      </p>

      <div className="mt-16 grid gap-0 md:grid-cols-3">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className="group -ml-px border-2 border-[var(--color-text)] p-7 transition-[background,transform] duration-300 ease-[var(--ease-lux)] hover:bg-[var(--color-surface)] hover:-translate-y-1"
            style={{ background: i === 1 ? "var(--color-surface)" : undefined }}
          >
            <span className="smash-display block text-5xl text-[var(--color-accent2)] transition-transform duration-300 ease-[var(--ease-snap)] group-hover:-translate-y-0.5">
              0{i + 1}
            </span>
            <h3 className="smash-display mt-4 text-2xl uppercase transition-colors duration-300 group-hover:text-[var(--color-accent)]">
              {p.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{p.body}</p>
          </div>
        ))}
      </div>

      <p
        ref={quoteSkew}
        className="smash-display smash-tight smash-neon-2 smash-neon-live mt-20 max-w-4xl text-[clamp(1.8rem,4.5vw,3.5rem)] uppercase leading-[0.95] text-[var(--color-accent2)]"
        style={{ willChange: "transform" }}
      >
        “{t("quote")}”
      </p>
      </div>
    </section>
  );
}
