"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "@/shared/convert/cart-store";
import { emitConfetti, emitFlyToCart } from "@/shared/convert/fly-to-cart";
import type { Locale } from "@/i18n/routing";
import { useSmashSfx } from "../motion";
import { T, STEP } from "../anim";
import { NeonText } from "./NeonText";

/**
 * SMASH carta — a brutalist price wall. Not cards: a hard-ruled list grid where
 * each row is a wide neon-bordered slab. Hover splits the name (RGB glitch) and
 * the whole row leans; clicking ADD fires the shared fly-to-cart flight + a
 * sound blip and writes straight into the shared cart store.
 */
export function MenuWall() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const add = useCart((s) => s.add);
  const { playTick } = useSmashSfx();
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(
    () =>
      items.filter((it) => activeCat === "all" || it.categoryId === activeCat),
    [items, activeCat],
  );

  return (
    <section
      id="carta"
      data-act="menu"
      className="relative mx-auto w-full max-w-7xl px-4 py-28 md:py-36"
    >
      <header className="mb-12 flex flex-col gap-6 border-b-2 border-[var(--color-text)] pb-8 md:flex-row md:items-end md:justify-between">
        <h2 className="smash-display smash-tight text-[clamp(3rem,11vw,9rem)] uppercase leading-[0.8]">
          <span className="smash-neon smash-neon-live text-[var(--color-accent)]">{t("title")}</span>
        </h2>
        <p className="max-w-xs text-sm uppercase tracking-[0.2em]">
          <NeonText>{t("subtitle")}</NeonText>
        </p>
      </header>

      {/* Category filter — brutalist toggle pills */}
      <div className="mb-10 flex flex-wrap gap-0">
        {[{ id: "all", label: t("all") }, ...categories.map((c) => ({ id: c.id, label: c.name[locale] }))].map(
          (c) => {
            const on = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCat(c.id);
                  playTick();
                }}
                className="smash-display -ml-px -mt-px border-2 border-[var(--color-text)] px-5 py-2 text-sm uppercase tracking-widest transition-[background,color] duration-200 ease-[var(--ease-snap)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)]"
                style={{
                  background: on ? "var(--color-accent2)" : undefined,
                  color: on ? "var(--color-bg)" : undefined,
                }}
                data-on={on}
              >
                {c.label}
              </button>
            );
          },
        )}
      </div>

      <ul className="border-t-2 border-[var(--color-text)]">
        {filtered.map((it, i) => (
          <motion.li
            key={it.id}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ ...T.reveal, delay: (i % 6) * STEP }}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b-2 border-[var(--color-text)] py-5 transition-[transform,background] duration-300 ease-[var(--ease-lux)] hover:translate-x-2 hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] md:gap-8"
          >
            <span className="smash-display w-10 text-lg tabular-nums text-[var(--color-muted)] transition-colors duration-300 ease-[var(--ease-lux)] group-hover:text-[var(--color-accent)] md:w-16 md:text-2xl">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <h3
                className="smash-display smash-glitch truncate text-2xl uppercase leading-none md:text-4xl"
                data-text={it.name[locale]}
              >
                {it.name[locale]}
              </h3>
              <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
                {it.desc[locale]}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <span className="smash-display text-xl tabular-nums md:text-3xl">
                <NeonText tone="accent2">
                  {(it.priceCents / 100).toFixed(2)}€
                </NeonText>
              </span>
              <button
                onClick={(e) => {
                  add({ id: it.id, name: it.name[locale], price: it.priceCents });
                  playTick();
                  emitFlyToCart({
                    from: e.currentTarget.getBoundingClientRect(),
                    color: "var(--color-accent)",
                  });
                  emitConfetti();
                }}
                className="smash-display border-2 border-[var(--color-text)] bg-[var(--color-text)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--color-bg)] transition-[background,transform,box-shadow] duration-200 ease-[var(--ease-snap)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:shadow-[3px_3px_0_0_var(--color-text)] active:translate-y-0 md:text-sm"
                aria-label={`${t("addToOrder")} ${it.name[locale]}`}
              >
                {t("addToOrder")}
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
