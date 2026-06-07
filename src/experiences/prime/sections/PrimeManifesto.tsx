"use client";

import { useTranslations } from "next-intl";
import { VariableMorphText, SplitText, Reveal } from "@/shared/motion/primitives";
import { LABEL_TRACK, MEASURE, PROSE, RULE } from "../theme";

/**
 * PRIME manifesto — the negative-space statement after the overture. A wide-set
 * caption, a towering kinetic-serif declaration whose variable axes morph as it
 * scrolls past, and a single justified prose column pinned to the right rule.
 * This is the page TRANSFORMING: the serif breathes wider/heavier on scrub.
 */
export function PrimeManifesto() {
  const t = useTranslations("hero");

  return (
    <section
      id="prime-manifesto"
      data-act="manifesto"
      className="relative flex min-h-[100svh] items-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <div
          className="mb-[clamp(3rem,9vh,7rem)] flex items-baseline gap-5"
          style={{ borderTop: RULE, paddingTop: "1.1rem" }}
        >
          <span
            className="text-[0.72rem] uppercase text-[var(--color-accent)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            II
          </span>
          <span
            className="text-[0.72rem] uppercase text-[var(--color-muted)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            {t("eyebrow")}
          </span>
        </div>

        <h2
          className="font-display text-[var(--color-text)]"
          style={{
            fontSize: "clamp(2.75rem, 9vw, 9rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.015em",
            fontWeight: 300,
          }}
        >
          <span className="block">
            <VariableMorphText driver="scroll" weight={[280, 560]} width={[88, 116]}>
              {t("title")}
            </VariableMorphText>
          </span>
          <span
            className="mt-2 block"
            style={{ color: "var(--color-accent)", fontStyle: "italic" }}
          >
            <SplitText text="à la carte" charClassName="" />
          </span>
        </h2>

        <Reveal className="ml-auto mt-[clamp(3rem,8vh,6rem)]" y={32}>
          <p
            className="text-[var(--color-muted)] [hanging-punctuation:first] [text-wrap:pretty] md:[text-align:justify]"
            style={{
              maxWidth: PROSE,
              fontSize: "clamp(1.05rem,1.6vw,1.35rem)",
              lineHeight: 1.7,
              borderTop: RULE,
              paddingTop: "1.6rem",
            }}
          >
            {t("subtitle")} {t("buildHint")}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
