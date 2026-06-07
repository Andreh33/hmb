"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/shared/data/useMenu";
import type { Locale } from "@/i18n/routing";
import { MenuItemCard } from "./MenuItemCard";

/** Skeleton card shown during the first paint window (perceived speed). */
function SkeletonCard() {
  return (
    <li className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)]">
      <div className="aspect-[4/3] w-full animate-pulse bg-[var(--color-muted)]/10" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--color-muted)]/12" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--color-muted)]/10" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-muted)]/10" />
        <div className="h-10 w-full animate-pulse rounded bg-[var(--color-muted)]/12" />
      </div>
    </li>
  );
}

export function MenuSection() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { categories, items } = useMenu();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  // Brief skeleton window so the grid never pops in raw (also covers async
  // data once A-DATA swaps the mock for a real query behind useMenu()).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 220);
    return () => window.clearTimeout(id);
  }, []);

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
        <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-lg text-[var(--color-muted)]">{t("subtitle")}</p>
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

      {!ready ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <MenuItemCard key={it.id} item={it} />
          ))}
        </ul>
      )}
    </section>
  );
}
