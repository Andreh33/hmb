"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useExperience } from "@/experiences/ExperienceProvider";
import { Link } from "@/i18n/navigation";
import { useSiteConfig } from "@/shared/data/useMenu";
import { OutlineToFill, Parallax } from "@/shared/motion/primitives";
import { EASE_ARR } from "@/shared/motion/easings";
import { LABEL_TRACK, MEASURE, PROSE, RULE, RULE_FAINT } from "../theme";

/* ----------------------------- Story / IV ------------------------------- */

export function PrimeStory() {
  const t = useTranslations("nav");
  const ts = useTranslations("story");
  return (
    <section
      id="historia"
      data-act="story"
      className="relative py-[clamp(5rem,14vh,11rem)]"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="mx-auto grid w-full gap-x-12 gap-y-10 md:grid-cols-[1fr_2fr]"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <div style={{ borderTop: RULE, paddingTop: "1.1rem" }}>
          <span
            className="block text-[0.72rem] uppercase text-[var(--color-accent)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            IV
          </span>
          <span
            className="mt-3 block text-[0.72rem] uppercase text-[var(--color-muted)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            {t("story")}
          </span>
        </div>

        <div style={{ borderTop: RULE, paddingTop: "1.1rem" }}>
          <p
            className="font-display text-[var(--color-text)]"
            style={{
              fontSize: "clamp(1.9rem,4.5vw,4rem)",
              lineHeight: 1.08,
              fontWeight: 300,
              letterSpacing: "-0.01em",
            }}
          >
            <Parallax depth={0.06}>
              <span>
                {ts("title")}.{" "}
                <em style={{ color: "var(--color-accent)" }}>
                  {ts("subtitle")}
                </em>
              </span>
            </Parallax>
          </p>

          <p
            className="mt-10 text-[var(--color-muted)] [text-wrap:pretty]"
            style={{ maxWidth: PROSE, fontSize: "1.05rem", lineHeight: 1.7 }}
          >
            {ts("body")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Location / V ------------------------------- */

export function PrimeLocation() {
  const t = useTranslations("nav");
  const site = useSiteConfig();

  return (
    <section
      id="ubicacion"
      data-act="location"
      className="relative py-[clamp(5rem,14vh,11rem)]"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <div style={{ borderTop: RULE, paddingTop: "1.1rem" }}>
          <span
            className="text-[0.72rem] uppercase text-[var(--color-accent)]"
            style={{ letterSpacing: LABEL_TRACK }}
          >
            V — {t("location")}
          </span>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: EASE_ARR.lux }}
          className="mt-8 font-display text-[var(--color-text)]"
          style={{
            fontSize: "clamp(2.2rem,6vw,5.5rem)",
            lineHeight: 0.98,
            fontWeight: 300,
            letterSpacing: "-0.015em",
          }}
        >
          {site.address}
        </motion.p>

        <ul
          className="mt-12 grid gap-x-12 gap-y-px md:grid-cols-3"
          style={{ borderTop: RULE_FAINT }}
        >
          {Object.entries(site.hours).map(([day, hrs]) => (
            <li
              key={day}
              className="flex items-baseline justify-between py-4"
              style={{ borderBottom: RULE_FAINT }}
            >
              <span
                className="text-[0.72rem] uppercase text-[var(--color-muted)]"
                style={{ letterSpacing: "0.16em" }}
              >
                {day}
              </span>
              <span className="font-display text-lg tabular-nums text-[var(--color-text)]">
                {hrs}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- Footer --------------------------------- */

export function PrimeFooter() {
  const site = useSiteConfig();
  const { meta } = useExperience();
  const tf = useTranslations("footer");
  const tl = useTranslations("legal");

  return (
    <footer
      data-act="footer"
      className="relative py-[clamp(4rem,9vh,7rem)]"
      style={{ background: "var(--color-bg)", borderTop: RULE }}
    >
      <div
        className="mx-auto flex w-full flex-col gap-12"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        <div
          className="font-display leading-none text-[var(--color-text)]"
          style={{ fontSize: "clamp(4rem,18vw,16rem)", fontWeight: 300 }}
        >
          <OutlineToFill
            text={meta.brand}
            fillColor="var(--color-text)"
            strokeColor="color-mix(in srgb, var(--color-text) 30%, transparent)"
            strokeWidth={1}
          />
        </div>

        <div
          className="flex flex-col gap-4 pt-8 text-[0.72rem] uppercase text-[var(--color-muted)] md:flex-row md:items-center md:justify-between"
          style={{ borderTop: RULE_FAINT, letterSpacing: "0.16em" }}
        >
          <span>{site.brand} — {meta.tagline}</span>
          <nav className="flex gap-6">
            <Link
              href="/aviso-legal"
              data-cursor="hover"
              className="transition-colors duration-300 hover:text-[var(--color-text)]"
            >
              {tl("noticeTitle")}
            </Link>
            <Link
              href="/privacidad"
              data-cursor="hover"
              className="transition-colors duration-300 hover:text-[var(--color-text)]"
            >
              {tf("privacy")}
            </Link>
            <Link
              href="/cookies"
              data-cursor="hover"
              className="transition-colors duration-300 hover:text-[var(--color-text)]"
            >
              {tf("cookies")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
