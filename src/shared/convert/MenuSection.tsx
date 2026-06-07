"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "./cart-store";
import type { Locale } from "@/i18n/routing";

const BADGE_LABEL: Record<string, { es: string; en: string }> = {
  nuevo: { es: "Nuevo", en: "New" },
  picante: { es: "Picante", en: "Spicy" },
  veggie: { es: "Veggie", en: "Veggie" },
};

export function MenuSection() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const add = useCart((s) => s.add);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const inCat = activeCat === "all" || it.categoryId === activeCat;
      const q = query.trim().toLowerCase();
      const inQuery =
        q === "" ||
        it.name[locale].toLowerCase().includes(q) ||
        it.desc[locale].toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [items, activeCat, query, locale]);

  return (
    <section
      id="carta"
      data-act="menu"
      className="relative mx-auto w-full max-w-6xl px-5 py-24 md:py-32"
    >
      <header className="mb-10">
        <h2 className="font-display text-5xl md:text-7xl leading-[0.95]">
          {t("title")}
        </h2>
        <p className="mt-3 text-[var(--color-muted)] text-lg">{t("subtitle")}</p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveCat("all")}
          data-active={activeCat === "all"}
          className="rounded-[var(--radius)] border border-[var(--color-muted)]/30 px-4 py-2 text-sm transition data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            data-active={activeCat === cat.id}
            className="rounded-[var(--radius)] border border-[var(--color-muted)]/30 px-4 py-2 text-sm transition data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
          >
            {cat.name[locale]}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="ml-auto rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent px-4 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-muted)]">{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <li
              key={it.id}
              className="group flex flex-col rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]/50"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight">
                  {it.name[locale]}
                </h3>
                <span className="shrink-0 font-display text-xl text-[var(--color-accent)]">
                  {(it.priceCents / 100).toFixed(2)}€
                </span>
              </div>
              <p className="mb-4 flex-1 text-sm text-[var(--color-muted)]">
                {it.desc[locale]}
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {it.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-[var(--color-accent)]/15 px-2.5 py-1 text-xs text-[var(--color-accent)]"
                  >
                    {BADGE_LABEL[b]?.[locale] ?? b}
                  </span>
                ))}
                {it.allergens.length > 0 && (
                  <span className="rounded-full border border-[var(--color-muted)]/30 px-2.5 py-1 text-xs text-[var(--color-muted)]">
                    {t("allergens")}: {it.allergens.join(", ")}
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  add({ id: it.id, name: it.name[locale], price: it.priceCents })
                }
                className="sear-glow w-full rounded-[var(--radius)] bg-[var(--color-accent)] px-4 py-2.5 font-medium text-[var(--color-bg)] transition active:scale-95"
              >
                {t("addToOrder")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
