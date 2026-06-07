"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { useMenu } from "@/shared/data/useMenu";
import { useCart } from "@/shared/convert/cart-store";
import type { Locale } from "@/i18n/routing";
import { EASE } from "@/shared/motion/easings";

// "¿Qué pido?" — a retro fortune wheel that lands on a real menu item. Pure
// decoration over real data (no invented dishes). Honors reduced motion.

const SEG_COLORS = ["var(--accent)", "var(--accent2)", "var(--glaze)"];

export function OrderWheel({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const { items } = useMenu();
  const add = useCart((s) => s.add);
  const reduce = useReducedMotion();

  // Pick a compact, balanced wheel from published mains + sides.
  const wheel = useMemo(
    () => items.filter((i) => !i.categoryId.includes("drinks")).slice(0, 8),
    [items],
  );

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [spinDur, setSpinDur] = useState(4.4);

  const n = wheel.length;
  const seg = n > 0 ? 360 / n : 360;

  const spin = useCallback(() => {
    if (spinning || n === 0) return;
    setPicked(null);
    const target = Math.floor(Math.random() * n);
    // Land the chosen segment's center at the top pointer (12 o'clock).
    const base = reduce ? 0 : 360 * (5 + Math.floor(Math.random() * 3));
    const center = target * seg + seg / 2;
    const next = rotation - (rotation % 360) + base + (360 - center);
    const dur = reduce ? 0.01 : 4.2 + Math.random() * 0.8;
    setSpinDur(dur);
    setSpinning(true);
    setRotation(next);
    window.setTimeout(
      () => {
        setSpinning(false);
        setPicked(target);
      },
      reduce ? 20 : dur * 1000,
    );
  }, [spinning, n, seg, rotation, reduce]);

  if (n === 0) return null;
  const pickedItem = picked !== null ? wheel[picked] : null;

  return (
    <div className={`flex flex-col items-center gap-7 ${className}`}>
      <div className="relative" style={{ width: "min(78vw, 360px)", aspectRatio: "1" }}>
        {/* Pointer */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[-10px] z-20 h-0 w-0 -translate-x-1/2"
          style={{
            borderLeft: "13px solid transparent",
            borderRight: "13px solid transparent",
            borderTop: "22px solid var(--color-text)",
            filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.25))",
          }}
        />
        {/* Rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 0 0 8px var(--color-text), 0 18px 40px -12px color-mix(in srgb, var(--color-text) 45%, transparent)",
          }}
        />
        <motion.div
          className="absolute inset-[8px] overflow-hidden rounded-full"
          animate={{ rotate: rotation }}
          transition={{
            duration: spinDur,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformOrigin: "center" }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {wheel.map((it, i) => {
              const a0 = (i * seg - 90) * (Math.PI / 180);
              const a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
              const x0 = 50 + 50 * Math.cos(a0);
              const y0 = 50 + 50 * Math.sin(a0);
              const x1 = 50 + 50 * Math.cos(a1);
              const y1 = 50 + 50 * Math.sin(a1);
              const large = seg > 180 ? 1 : 0;
              const mid = (i * seg + seg / 2 - 90) * (Math.PI / 180);
              const lx = 50 + 31 * Math.cos(mid);
              const ly = 50 + 31 * Math.sin(mid);
              const fill = SEG_COLORS[i % SEG_COLORS.length] ?? "var(--accent)";
              const label = it?.name[locale] ?? "";
              return (
                <g key={it?.id ?? i}>
                  <path
                    d={`M50 50 L ${x0.toFixed(2)} ${y0.toFixed(2)} A 50 50 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                    fill={fill}
                    stroke="var(--color-surface)"
                    strokeWidth={0.8}
                  />
                  <text
                    x={lx.toFixed(2)}
                    y={ly.toFixed(2)}
                    fill="var(--color-surface)"
                    fontSize={3.2}
                    fontWeight={700}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${i * seg + seg / 2} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {label.length > 14 ? `${label.slice(0, 13)}…` : label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
        {/* Hub */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          aria-label="Girar la ruleta"
          className="absolute left-1/2 top-1/2 z-10 grid h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-text)] transition-transform duration-300 hover:scale-105 active:scale-95 disabled:opacity-70"
          style={{ transitionTimingFunction: EASE.back }}
        >
          {spinning ? "···" : "Girar"}
        </button>
      </div>

      <div className="min-h-[88px] text-center">
        {pickedItem ? (
          <motion.div
            key={pickedItem.id}
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="font-display text-2xl md:text-3xl">
              {pickedItem.name[locale]}
            </p>
            <p className="max-w-xs text-sm text-[var(--color-muted)]">
              {pickedItem.desc[locale]}
            </p>
            <button
              type="button"
              onClick={() =>
                add({
                  id: pickedItem.id,
                  name: pickedItem.name[locale],
                  price: pickedItem.priceCents,
                })
              }
              className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-surface)] shadow-[3px_3px_0_var(--color-text)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              style={{ transitionTimingFunction: EASE.back }}
            >
              Añadir · {(pickedItem.priceCents / 100).toFixed(2)} €
            </button>
          </motion.div>
        ) : (
          <p className="pt-6 text-sm uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {spinning ? "Decidiendo…" : "Gira y deja que la casa elija"}
          </p>
        )}
      </div>
    </div>
  );
}
