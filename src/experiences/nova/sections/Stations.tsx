"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu, useSiteConfig } from "@/shared/data/useMenu";
import { MenuItemCard } from "@/shared/convert/MenuItemCard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { KineticMarquee, Reveal } from "@/shared/motion/primitives";
import { EASE } from "@/shared/motion/easings";
import { v } from "../theme";

/**
 * A frosted-glass panel that floats over the particle canvas. Hover lifts it a
 * touch and warms the border + a top sheen, so static panels gain life without
 * stealing focus from the cloud.
 */
function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl ${className}`}
      style={{
        borderColor: hover ? `${v.accent2}40` : `${v.muted}26`,
        background: `${v.surface}b3`,
        boxShadow: hover
          ? `0 40px 90px -38px ${v.bg}, 0 0 50px -20px ${v.accent2}55, inset 0 1px 0 ${v.text}22`
          : `0 30px 80px -40px ${v.bg}, inset 0 1px 0 ${v.text}14`,
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: `transform 0.6s ${EASE.lux}, box-shadow 0.6s ${EASE.lux}, border-color 0.6s ${EASE.lux}`,
        willChange: "transform",
      }}
    >
      {/* Specular sheen sweeping the top edge on hover. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(115deg, transparent 35%, ${v.text}0d 50%, transparent 65%)`,
          opacity: hover ? 1 : 0,
          transition: `opacity 0.6s ${EASE.lux}`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

/** A category filter pill with an eased active/hover transition + glow. */
function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      data-active={active}
      className="rounded-full border px-5 py-2 text-sm"
      style={{
        borderColor: active ? v.accent : hover ? `${v.accent2}66` : `${v.muted}33`,
        background: active ? v.accent : hover ? `${v.surface}cc` : "transparent",
        color: active ? v.bg : v.text,
        boxShadow: active
          ? `0 0 32px ${v.accent}66`
          : hover
            ? `0 0 22px ${v.accent2}33`
            : "none",
        transform: hover && !active ? "translateY(-1px)" : "translateY(0)",
        letterSpacing: "0.01em",
        transition: `all 0.45s ${EASE.lux}`,
      }}
    >
      {label}
    </button>
  );
}

/**
 * MENU station — the carta, NOVA-styled. Category filter as orbit pills, cards
 * in frosted glass floating over the canvas. Reuses the shared MenuItemCard so
 * fly-to-cart, allergens and badges stay consistent with conversion contracts.
 */
export function NovaMenu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const [cat, setCat] = useState("all");

  const filtered = useMemo(
    () => items.filter((it) => cat === "all" || it.categoryId === cat),
    [items, cat],
  );

  return (
    <section
      id="carta"
      data-act="menu"
      className="relative mx-auto w-full max-w-6xl px-5 py-28"
      style={{ zIndex: 2 }}
    >
      <Reveal>
        <p
          className="mb-3 text-sm uppercase"
          style={{
            color: v.accent2,
            letterSpacing: "0.4em",
            textIndent: "0.4em",
            textShadow: `0 0 20px ${v.accent2}40`,
          }}
        >
          {t("popular")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          className="font-display font-black"
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.025em",
            color: v.text,
            textWrap: "balance",
          }}
        >
          {t("title")}
        </h2>
      </Reveal>

      <div
        className="mt-8 mb-10 flex flex-wrap gap-2"
        style={{ pointerEvents: "auto" }}
      >
        {[{ id: "all", label: t("all") }, ...categories.map((c) => ({ id: c.id, label: c.name[locale] }))].map(
          (c) => {
            const active = cat === c.id;
            return (
              <FilterPill
                key={c.id}
                active={active}
                label={c.label}
                onClick={() => setCat(c.id)}
              />
            );
          },
        )}
      </div>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => (
          <MenuItemCard key={it.id} item={it} />
        ))}
      </ul>
    </section>
  );
}

/** STORY station — brand statement, kinetic marquee + variable display type. */
export function NovaStory() {
  const t = useTranslations("nav");
  return (
    <section
      id="historia"
      data-act="story"
      className="relative w-full py-28"
      style={{ zIndex: 2 }}
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p
            className="mb-4 text-sm uppercase"
            style={{
              color: v.accent2,
              letterSpacing: "0.4em",
              textIndent: "0.4em",
              textShadow: `0 0 20px ${v.accent2}40`,
            }}
          >
            {t("story")}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p
            className="max-w-4xl font-display"
            style={{
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
              color: v.text,
              textWrap: "balance",
            }}
          >
            Cada hamburguesa empieza como cien mil partículas de luz y se
            condensa, capa a capa, en algo que{" "}
            <span
              style={{
                color: "transparent",
                backgroundImage: `linear-gradient(100deg, ${v.accent}, ${v.glaze} 50%, ${v.accent2})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              puedes morder
            </span>
            .
          </p>
        </Reveal>
      </div>
      <div className="mt-16" style={{ opacity: 0.55 }}>
        <KineticMarquee speed={40}>
          <span
            className="px-8 font-display font-black uppercase"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 7rem)",
              letterSpacing: "-0.01em",
              color: "transparent",
              WebkitTextStrokeWidth: 1,
              WebkitTextStrokeColor: v.glaze,
            }}
          >
            NOVA&nbsp;·&nbsp;BRASA&nbsp;·&nbsp;LUZ&nbsp;·&nbsp;MATERIA&nbsp;·&nbsp;
          </span>
        </KineticMarquee>
      </div>
    </section>
  );
}

/** LOCATION station — address + hours in floating glass. */
export function NovaLocation() {
  const t = useTranslations("nav");
  const site = useSiteConfig();
  return (
    <section
      id="ubicacion"
      data-act="location"
      className="relative mx-auto w-full max-w-6xl px-5 py-28"
      style={{ zIndex: 2 }}
    >
      <Reveal>
        <p
          className="mb-3 text-sm uppercase"
          style={{
            color: v.accent2,
            letterSpacing: "0.4em",
            textIndent: "0.4em",
            textShadow: `0 0 20px ${v.accent2}40`,
          }}
        >
          {t("location")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="grid gap-6 md:grid-cols-2">
          <Glass className="p-8">
            <p
              className="font-display"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)", color: v.text }}
            >
              {site.address}
            </p>
          </Glass>
          <Glass className="p-8">
            <ul className="space-y-2" style={{ color: v.muted }}>
              {Object.entries(site.hours).map(([day, hrs]) => (
                <li key={day} className="flex justify-between gap-4">
                  <span className="uppercase tracking-wider">{day}</span>
                  <span className="tabular-nums" style={{ color: v.text }}>
                    {hrs}
                  </span>
                </li>
              ))}
            </ul>
          </Glass>
        </div>
      </Reveal>
    </section>
  );
}

/** Footer link with an animated accent underline that wipes in on hover. */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        position: "relative",
        color: hover ? v.text : v.muted,
        transition: `color 0.4s ${EASE.lux}`,
      }}
    >
      {children}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -3,
          height: 1,
          background: v.accent,
          transformOrigin: "left",
          transform: `scaleX(${hover ? 1 : 0})`,
          transition: `transform 0.45s ${EASE.lux}`,
        }}
      />
    </Link>
  );
}

/** FOOTER — minimal, signed, floats over the settled cloud. */
export function NovaFooter() {
  const site = useSiteConfig();
  return (
    <footer
      data-act="footer"
      className="relative w-full border-t px-5 py-14"
      style={{ zIndex: 2, borderColor: `${v.muted}26` }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span
          className="font-display font-black"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            letterSpacing: "-0.03em",
            color: v.text,
            textShadow: `0 0 50px ${v.accent}33`,
          }}
        >
          {site.brand}
        </span>
        <nav className="flex gap-6 text-sm">
          <FooterLink href="/aviso-legal">Aviso legal</FooterLink>
          <FooterLink href="/privacidad">Privacidad</FooterLink>
          <FooterLink href="/cookies">Cookies</FooterLink>
        </nav>
      </div>
    </footer>
  );
}
