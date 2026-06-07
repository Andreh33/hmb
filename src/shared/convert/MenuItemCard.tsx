"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { MenuItem } from "@/shared/data/types";
import type { Locale } from "@/i18n/routing";
import { useCart } from "./cart-store";
import { Badge } from "./badges";
import { resolveAllergen } from "./allergens";
import { emitConfetti, emitFlyToCart } from "./fly-to-cart";
import { EASE_ARR } from "@/shared/motion/easings";

/**
 * Premium menu card: photo with zoom-on-hover, badge row (icons), allergen
 * chips (own EU SVG set), live price, and an "add" action that fires the
 * fly-to-cart flight + confetti toast. Pure presentational + cart side effect;
 * safe to drop into any experience grid.
 */
export function MenuItemCard({ item }: { item: MenuItem }) {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const add = useCart((s) => s.add);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = useState(0);

  const price = (item.priceCents / 100).toFixed(2);

  function handleAdd() {
    add({ id: item.id, name: item.name[locale], price: item.priceCents });
    setPulse((p) => p + 1);
    const rect = imgWrapRef.current?.getBoundingClientRect();
    if (rect) {
      emitFlyToCart({
        from: rect,
        image: item.imageUrl,
        color: "var(--color-accent)",
      });
    }
    emitConfetti();
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE_ARR.lux }}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] transition-colors duration-300 hover:border-[var(--color-accent)]/50"
    >
      {/* Photo (zoom-hover). Hero is image-only per §5; menu uses real photos. */}
      <div
        ref={imgWrapRef}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg)]"
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name[locale]}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, var(--color-glaze) 0%, transparent 55%), linear-gradient(140deg, var(--color-surface), var(--color-bg))",
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent opacity-60" />
        {item.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {item.badges.map((b) => (
              <Badge key={b} badge={b} locale={locale} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight">
            {item.name[locale]}
          </h3>
          <span className="shrink-0 font-display text-xl text-[var(--color-accent)]">
            {price}€
          </span>
        </div>
        <p className="mb-4 flex-1 text-sm text-[var(--color-muted)]">
          {item.desc[locale]}
        </p>

        {item.allergens.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="sr-only">{t("allergens")}</span>
            {item.allergens.map((slug) => {
              const { label, Icon } = resolveAllergen(slug);
              return (
                <span
                  key={slug}
                  title={label[locale]}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--color-muted)]/25 px-2 py-1 text-[var(--color-muted)] transition-colors group-hover:border-[var(--color-muted)]/40"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[0.7rem] leading-none">
                    {label[locale]}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <motion.button
          key={pulse}
          onClick={handleAdd}
          whileTap={{ scale: 0.94 }}
          className="sear-glow mt-auto w-full rounded-[var(--radius)] bg-[var(--color-accent)] px-4 py-2.5 font-medium text-[var(--color-bg)] transition-[filter] hover:brightness-110"
        >
          {t("addToOrder")}
        </motion.button>
      </div>
    </motion.li>
  );
}
