"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCart } from "./cart-store";
import { buildWhatsAppOrder } from "./whatsapp";
import { useSiteConfig } from "@/shared/data/useMenu";

export function OrderBar() {
  const t = useTranslations("order");
  const site = useSiteConfig();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const notes = useCart((s) => s.notes);
  const setNotes = useCart((s) => s.setNotes);
  const count = useCart((s) => s.count());
  const subtotal = useCart((s) => s.subtotal());
  const [open, setOpen] = useState(false);

  const href = buildWhatsAppOrder(
    site.whatsapp,
    lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
    site.brand,
    notes || undefined,
  );

  return (
    <>
      <AnimatePresence>
        {open && lines.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && lines.length > 0 && (
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-[var(--color-muted)]/20 bg-[var(--color-surface)] p-5"
          >
            <h3 className="mb-4 font-display text-2xl">{t("title")}</h3>
            <ul className="mb-4 divide-y divide-[var(--color-muted)]/15">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <span className="flex-1">{l.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(l.id, l.qty - 1)}
                      className="h-7 w-7 rounded-[var(--radius)] border border-[var(--color-muted)]/30"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.id, l.qty + 1)}
                      className="h-7 w-7 rounded-[var(--radius)] border border-[var(--color-muted)]/30"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right text-[var(--color-accent)]">
                    {((l.price * l.qty) / 100).toFixed(2)}€
                  </span>
                </li>
              ))}
            </ul>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notes")}
              rows={2}
              className="mb-4 w-full rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent p-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="sear-glow block w-full rounded-[var(--radius)] bg-[var(--color-accent)] py-3.5 text-center font-semibold text-[var(--color-bg)]"
            >
              {t("whatsapp")} · {(subtotal / 100).toFixed(2)}€
            </a>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {count > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setOpen((v) => !v)}
            className="sear-glow fixed inset-x-4 bottom-4 z-[55] flex items-center justify-between rounded-[var(--radius)] bg-[var(--color-accent)] px-5 py-4 font-semibold text-[var(--color-bg)] md:inset-x-auto md:right-6 md:w-96"
          >
            <span>{t("items", { count })}</span>
            <span>{(subtotal / 100).toFixed(2)}€ →</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
