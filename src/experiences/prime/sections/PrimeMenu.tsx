"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "@/shared/convert/cart-store";
import { emitConfetti, emitFlyToCart } from "@/shared/convert/fly-to-cart";
import type { Locale } from "@/i18n/routing";
import type { MenuItem } from "@/shared/data/types";
import { EASE_ARR } from "@/shared/motion/easings";
import { folio, LABEL_TRACK, MEASURE, RULE, RULE_FAINT } from "../theme";

/**
 * PRIME carte — not a card grid. An editorial ledger: each dish is a typeset
 * line with a roman folio, the name in Cormorant, a leader rule to the price,
 * and a quiet "add" that reveals on hover and fires the shared fly-to-cart.
 * Category filter is a set of kinetic serifs along the top rule.
 */
export function PrimeMenu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(
    () => items.filter((it) => activeCat === "all" || it.categoryId === activeCat),
    [items, activeCat],
  );

  return (
    <section
      id="carta"
      data-act="menu"
      className="relative py-[clamp(5rem,12vh,9rem)]"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: MEASURE, paddingInline: "clamp(1.25rem,4vw,3rem)" }}
      >
        {/* Masthead row */}
        <div
          className="mb-[clamp(2.5rem,6vh,4.5rem)] flex flex-wrap items-end justify-between gap-6"
          style={{ borderTop: RULE, paddingTop: "1.4rem" }}
        >
          <div>
            <span
              className="block text-[0.72rem] uppercase text-[var(--color-accent)]"
              style={{ letterSpacing: LABEL_TRACK }}
            >
              III
            </span>
            <h2
              className="mt-3 font-display text-[var(--color-text)]"
              style={{
                fontSize: "clamp(2.5rem,7vw,6rem)",
                lineHeight: 0.92,
                fontWeight: 300,
                letterSpacing: "-0.01em",
              }}
            >
              {t("title")}
            </h2>
          </div>
          <p
            className="max-w-[32ch] text-[var(--color-muted)]"
            style={{ fontSize: "1rem", lineHeight: 1.6 }}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Category filter — kinetic serif tabs */}
        <div
          className="mb-2 flex flex-wrap items-center gap-x-7 gap-y-2 pb-5"
          style={{ borderBottom: RULE_FAINT }}
        >
          <CatTab
            label={t("all")}
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          />
          {categories.map((cat) => (
            <CatTab
              key={cat.id}
              label={cat.name[locale]}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            />
          ))}
        </div>

        {/* The ledger */}
        <ul>
          {filtered.length === 0 ? (
            <li className="py-20 text-center text-[var(--color-muted)]">
              {t("empty")}
            </li>
          ) : (
            filtered.map((it, i) => (
              <PrimeMenuRow key={it.id} item={it} index={i} locale={locale} />
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

function CatTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      data-active={active}
      className="group/tab relative font-display text-[var(--color-muted)] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] data-[active=true]:text-[var(--color-text)] hover:text-[var(--color-text)]"
      style={{
        fontSize: "clamp(1.4rem,2.6vw,2rem)",
        lineHeight: 1.1,
        fontStyle: active ? "italic" : "normal",
        fontWeight: 300,
      }}
    >
      {label}
      {/* Underline: full when active, grows from center on hover otherwise. */}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 block h-px origin-center bg-[var(--color-accent)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tab:scale-x-100"
        style={{
          width: "100%",
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </button>
  );
}

function PrimeMenuRow({
  item,
  index,
  locale,
}: {
  item: MenuItem;
  index: number;
  locale: Locale;
}) {
  const t = useTranslations("menu");
  const add = useCart((s) => s.add);
  const price = (item.priceCents / 100).toFixed(2);

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    add({ id: item.id, name: item.name[locale], price: item.priceCents });
    const rect = (
      e.currentTarget.closest("li") ?? e.currentTarget
    ).getBoundingClientRect();
    emitFlyToCart({ from: rect, image: item.imageUrl, color: "var(--color-accent)" });
    emitConfetti();
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, ease: EASE_ARR.lux, delay: (index % 6) * 0.05 }}
      className="group relative"
      style={{ borderBottom: RULE_FAINT }}
    >
      {/* Hover gilt wash bleeding from the left rule */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--color-accent) 7%, transparent), transparent 70%)",
        }}
      />
      <div className="relative grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-[clamp(1.1rem,2.4vh,2rem)] md:grid-cols-[3.5rem_1fr_auto_auto] md:gap-x-8">
        <span
          className="text-[0.72rem] uppercase text-[var(--color-muted)] transition-colors duration-500 group-hover:text-[var(--color-accent)]"
          style={{ letterSpacing: "0.12em" }}
        >
          {folio(index)}
        </span>

        <div className="min-w-0">
          <h3
            className="font-display leading-none text-[var(--color-text)] transition-colors duration-300 group-hover:text-[var(--color-accent)]"
            style={{
              fontSize: "clamp(1.6rem,3.6vw,3rem)",
              fontWeight: 300,
              letterSpacing: "-0.01em",
            }}
          >
            {item.name[locale]}
          </h3>
          <p
            className="mt-2 max-w-[52ch] text-[var(--color-muted)]"
            style={{ fontSize: "0.95rem", lineHeight: 1.55 }}
          >
            {item.desc[locale]}
          </p>
        </div>

        <span
          className="self-baseline justify-self-end font-display tabular-nums text-[var(--color-text)] transition-colors duration-500 group-hover:text-[var(--color-accent)]"
          style={{ fontSize: "clamp(1.2rem,2.2vw,1.75rem)", fontWeight: 300 }}
        >
          {price}
          <span className="ml-0.5 text-[var(--color-muted)]">€</span>
        </span>

        {/* Add — quiet, reveals on hover (desktop), always tappable on mobile */}
        <button
          onClick={handleAdd}
          data-cursor="hover"
          aria-label={`${t("addToOrder")} — ${item.name[locale]}`}
          className="col-span-3 mt-3 justify-self-start text-[0.72rem] uppercase text-[var(--color-accent)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--color-text)] md:col-span-1 md:mt-0 md:translate-x-2 md:justify-self-end md:self-baseline md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100"
          style={{ letterSpacing: "0.18em", borderBottom: RULE }}
        >
          {t("addToOrder")}
        </button>
      </div>
    </motion.li>
  );
}
