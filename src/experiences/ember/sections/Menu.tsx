"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Locale } from "@/i18n/routing";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "@/shared/convert/cart-store";
import { emitConfetti, emitFlyToCart } from "@/shared/convert/fly-to-cart";
import { Badge } from "@/shared/convert/badges";
import { Magnetic } from "@/shared/motion/primitives";
import { EMBER_EASE } from "../theme";

/**
 * EMBER carta — editorial dark-gourmet layout (NOT the shared grid). A large
 * "signature" hero card (the FLIP target the morph act lands the hero into) sits
 * beside a typographic price list grouped by category. Filtering by category,
 * add-to-cart wired through the shared cart + fly-to-cart + confetti.
 */
export function Menu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const add = useCart((s) => s.add);
  const [activeCat, setActiveCat] = useState("all");

  const featured = items[0];
  const rest = useMemo(
    () =>
      items
        .slice(1)
        .filter((it) => activeCat === "all" || it.categoryId === activeCat),
    [items, activeCat],
  );

  const featImgRef = useRef<HTMLDivElement>(null);

  function addItem(
    item: { id: string; name: string; price: number },
    rect: DOMRect | undefined,
    image?: string,
  ) {
    add(item);
    if (rect) emitFlyToCart({ from: rect, image, color: "var(--color-accent)" });
    emitConfetti();
  }

  return (
    <section
      id="carta"
      className="relative mx-auto w-full max-w-7xl px-6 py-28 md:px-10 md:py-40"
    >
      <header className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p
            className="mb-3 text-xs uppercase tracking-[0.42em] text-[var(--color-accent)]"
            style={{ fontFamily: "var(--body)" }}
          >
            {t("subtitle")}
          </p>
          <h2
            className="text-6xl font-semibold leading-[0.86] tracking-tight text-[var(--color-text)] md:text-8xl"
            style={{ fontFamily: "var(--display)" }}
          >
            {t("title")}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            {t("all")}
          </CatChip>
          {categories.map((cat) => (
            <CatChip
              key={cat.id}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.name[locale]}
            </CatChip>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Featured signature — FLIP morph target from the hero */}
        {featured ? (
          <motion.article
            id="ember-menu-first"
            data-flip-id="ember-hero"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EMBER_EASE }}
            className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-accent)]/25 bg-[var(--color-surface)]"
          >
            <div
              ref={featImgRef}
              className="relative aspect-[5/4] w-full overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{
                  background:
                    "radial-gradient(120% 110% at 60% 30%, var(--color-glaze) 0%, transparent 55%), linear-gradient(150deg, var(--color-surface), var(--color-bg))",
                }}
              />
              {featured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.imageUrl}
                  alt={featured.name[locale]}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              ) : null}
              <div className="absolute left-4 top-4 flex gap-1.5">
                {featured.badges.map((b) => (
                  <Badge key={b} badge={b} locale={locale} />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent" />
            </div>
            <div className="p-7 md:p-9">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h3
                  className="text-4xl font-semibold leading-none text-[var(--color-text)] md:text-5xl"
                  style={{ fontFamily: "var(--display)" }}
                >
                  {featured.name[locale]}
                </h3>
                <span className="shrink-0 text-2xl text-[var(--color-accent)]">
                  {(featured.priceCents / 100).toFixed(2)}€
                </span>
              </div>
              <p className="mb-6 max-w-md text-[var(--color-muted)]">
                {featured.desc[locale]}
              </p>
              <Magnetic strength={0.35}>
                <button
                  data-cursor="hover"
                  onClick={() =>
                    addItem(
                      {
                        id: featured.id,
                        name: featured.name[locale],
                        price: featured.priceCents,
                      },
                      featImgRef.current?.getBoundingClientRect(),
                      featured.imageUrl,
                    )
                  }
                  className="sear-glow w-full rounded-[var(--radius)] bg-[var(--color-accent)] px-6 py-3.5 font-medium uppercase tracking-[0.15em] text-[var(--color-bg)] transition hover:brightness-110"
                >
                  {t("addToOrder")}
                </button>
              </Magnetic>
            </div>
          </motion.article>
        ) : null}

        {/* Typographic price list */}
        <ul className="flex flex-col">
          {rest.map((it, i) => (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EMBER_EASE, delay: i * 0.04 }}
              className="group flex items-center gap-5 border-b border-[var(--color-muted)]/12 py-5 transition-colors duration-500 hover:border-[var(--color-accent)]/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <h4
                    className="truncate text-xl font-medium text-[var(--color-text)] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[var(--color-accent)] md:text-2xl"
                    style={{ fontFamily: "var(--display)" }}
                  >
                    {it.name[locale]}
                  </h4>
                  {/* Leader dots that kindle to gold on hover */}
                  <span className="h-px flex-1 translate-y-[-2px] bg-[var(--color-muted)]/20 transition-colors duration-500 group-hover:bg-[var(--color-accent)]/40" />
                  <span className="shrink-0 tabular-nums text-[var(--color-accent)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5">
                    {(it.priceCents / 100).toFixed(2)}€
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
                  {it.desc[locale]}
                </p>
              </div>
              <button
                data-cursor="hover"
                aria-label={t("addToOrder")}
                onClick={(e) =>
                  addItem(
                    { id: it.id, name: it.name[locale], price: it.priceCents },
                    (e.currentTarget as HTMLElement).getBoundingClientRect(),
                    it.imageUrl,
                  )
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--color-accent)]/40 text-lg text-[var(--color-accent)] transition-[background-color,color,transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:shadow-[0_0_22px_rgba(224,153,47,0.45)] active:scale-95"
              >
                +
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      data-cursor="hover"
      className="rounded-full border border-[var(--color-muted)]/25 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-[var(--color-muted)] transition-[color,background-color,border-color] duration-300 hover:border-[var(--color-accent)]/60 hover:text-[var(--color-text)] data-[active=true]:border-[var(--color-accent)] data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
      style={{ fontFamily: "var(--body)" }}
    >
      {children}
    </button>
  );
}
