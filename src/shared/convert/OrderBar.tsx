"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useCart } from "./cart-store";
import { Cart } from "./Cart";
import { FlyToCartLayer } from "./FlyToCartLayer";
import { ConfettiToast } from "./ConfettiToast";

const ADDED_TOAST: Record<Locale, string> = {
  es: "Añadido a tu pedido",
  en: "Added to your order",
};

/**
 * Conversion bar: floating cart FAB (with live subtotal + bump animation), the
 * full Cart panel, the fly-to-cart flight layer (anchored to the FAB) and the
 * confetti toast. Public surface unchanged — still <OrderBar /> with no props.
 */
export function OrderBar() {
  const t = useTranslations("order");
  const locale = useLocale() as Locale;
  const count = useCart((s) => s.count());
  const subtotal = useCart((s) => s.subtotal());
  const [open, setOpen] = useState(false);

  // Anchor the flight target to the FAB's live position.
  const fabRef = useRef<HTMLButtonElement>(null);
  const getTarget = useCallback(
    () => fabRef.current?.getBoundingClientRect() ?? null,
    [],
  );

  return (
    <>
      <FlyToCartLayer getTarget={getTarget} />
      <ConfettiToast message={ADDED_TOAST[locale]} />

      <Cart open={open} onOpenChange={setOpen} />

      <AnimatePresence>
        {count > 0 && (
          <motion.button
            ref={fabRef}
            key="orderbar-fab"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setOpen((v) => !v)}
            className="sear-glow fixed inset-x-4 bottom-4 z-[55] flex items-center justify-between rounded-[var(--radius)] bg-[var(--color-accent)] px-5 py-4 font-semibold text-[var(--color-bg)] transition hover:brightness-110 md:inset-x-auto md:right-6 md:w-96"
          >
            <span className="flex items-center gap-2">
              {/* count bump */}
              <motion.span
                key={count}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="grid h-7 min-w-7 place-items-center rounded-full bg-[var(--color-bg)]/20 px-2 text-sm tabular-nums"
              >
                {count}
              </motion.span>
              {t("items", { count })}
            </span>
            <motion.span
              key={subtotal}
              initial={{ scale: 1.12, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="tabular-nums"
            >
              {(subtotal / 100).toFixed(2)}€ →
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
