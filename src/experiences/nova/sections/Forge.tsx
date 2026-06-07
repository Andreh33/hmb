"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "@/shared/convert/cart-store";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/shared/motion/primitives";
import { EASE } from "@/shared/motion/easings";
import { v } from "../theme";
import { useForge } from "../scroll";

/**
 * Layer images used as the particle source for the forge. Menu mock items have
 * no photos yet, so each signature item maps to one of the photoreal hero layer
 * placeholders — when picked, that image is sampled into the particle cloud and
 * RE-COMPOSED in front of the user (the "build your burger" moment). Real photos
 * drop in via the CMS later and the same code samples them instead.
 */
const FORGE_SOURCES = [
  "/hero/demo/layer-patty.svg",
  "/hero/demo/layer-cheese.svg",
  "/hero/demo/layer-lettuce.svg",
  "/hero/demo/layer-bun-top.svg",
  "/hero/demo/layer-bun-bottom.svg",
] as const;

/**
 * One ingredient picker. Active = chosen (warm glow, accent chip). Hover lifts
 * and cools-to-warm with an eased transition so the picker feels like a precise
 * instrument; the click fires the particle burst that recomposes the cloud.
 */
function ForgePill({
  index,
  active,
  name,
  priceCents,
  addLabel,
  onClick,
}: {
  index: number;
  active: boolean;
  name: string;
  priceCents: number;
  addLabel: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const lifted = active || hover;
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      data-active={active}
      className="group flex items-center gap-3 rounded-full border px-5 py-3 text-left backdrop-blur"
      style={{
        borderColor: active
          ? v.accent
          : hover
            ? `${v.accent2}66`
            : `${v.muted}33`,
        background: active
          ? `${v.accent}1f`
          : hover
            ? `${v.surface}ee`
            : `${v.surface}cc`,
        boxShadow: active
          ? `0 0 44px ${v.accent}66`
          : hover
            ? `0 0 28px ${v.accent2}33`
            : "none",
        transform: lifted ? "scale(1.03) translateY(-2px)" : "scale(1) translateY(0)",
        transition: `all 0.5s ${EASE.lux}`,
        willChange: "transform",
      }}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold tabular-nums"
        style={{
          background: active ? v.accent : hover ? `${v.accent2}33` : `${v.muted}22`,
          color: active ? v.bg : v.text,
          boxShadow: active ? `0 0 18px ${v.accent}aa` : "none",
          transition: `all 0.5s ${EASE.lux}`,
        }}
      >
        {index + 1}
      </span>
      <span className="flex flex-col">
        <span
          className="font-display text-lg"
          style={{ color: v.text, letterSpacing: "-0.01em" }}
        >
          {name}
        </span>
        <span className="text-xs tabular-nums" style={{ color: v.muted }}>
          {(priceCents / 100).toFixed(2)}€ · {addLabel}
        </span>
      </span>
    </button>
  );
}

/**
 * FORGE station — the mini "construye tu burger". Real DOM text + buttons float
 * over the canvas; tapping an ingredient fires a particle burst (useForge.pick)
 * so the chosen item literally composes itself out of the cloud, and adds it to
 * the cart. Indexable, accessible, and conversion-wired.
 */
export function NovaForge() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const { items } = useMenu();
  const pick = useForge((s) => s.pick);
  const pickedId = useForge((s) => s.pickedId);
  const add = useCart((s) => s.add);

  // The signature line is the most photogenic — use it for the forge.
  const forgeItems = items
    .filter((it) => it.categoryId === "c-signature")
    .slice(0, FORGE_SOURCES.length);

  return (
    <section
      id="forge"
      data-act="forge"
      className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-5 py-28"
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
          {t("category")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          className="font-display font-black"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.025em",
            color: v.text,
            textWrap: "balance",
          }}
        >
          {t("ingredients")}
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p
          className="mt-4 max-w-lg text-lg"
          style={{ color: v.muted, textWrap: "balance" }}
        >
          {t("subtitle")}
        </p>
      </Reveal>

      <ul
        className="mt-10 flex flex-wrap gap-3"
        style={{ pointerEvents: "auto" }}
      >
        {forgeItems.map((it, i) => {
          const src = FORGE_SOURCES[i] ?? FORGE_SOURCES[0]!;
          const active = pickedId === it.id;
          return (
            <li key={it.id}>
              <ForgePill
                index={i}
                active={active}
                name={it.name[locale]}
                priceCents={it.priceCents}
                addLabel={t("addToOrder")}
                onClick={() => {
                  pick(it.id, src);
                  add({ id: it.id, name: it.name[locale], price: it.priceCents });
                }}
              />
            </li>
          );
        })}
      </ul>

      <p className="mt-8 max-w-md text-sm" style={{ color: v.muted }}>
        {t("viewDetails")} — {t("popular")}
      </p>
    </section>
  );
}
