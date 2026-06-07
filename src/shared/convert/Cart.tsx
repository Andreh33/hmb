"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useCart } from "./cart-store";
import { buildWhatsAppOrder, suggestTimeSlots } from "./whatsapp";
import { useSiteConfig } from "@/shared/data/useMenu";
import { EASE_ARR } from "@/shared/motion/easings";

const WHATSAPP_OPTS: Record<
  Locale,
  { greeting: (b: string) => string; total: string; notes: string; schedule: string }
> = {
  es: {
    greeting: (b) => `¡Hola ${b}! Quiero pedir:`,
    total: "Total",
    notes: "Notas",
    schedule: "Hora",
  },
  en: {
    greeting: (b) => `Hi ${b}! I'd like to order:`,
    total: "Total",
    notes: "Notes",
    schedule: "Pickup",
  },
};

const ASAP_LABEL: Record<Locale, string> = { es: "Lo antes posible", en: "As soon as possible" };
const SCHEDULE_TITLE: Record<Locale, string> = { es: "¿Para cuándo?", en: "For when?" };
const LINE_NOTE_PH: Record<Locale, string> = { es: "Nota (ej. sin cebolla)", en: "Note (e.g. no onion)" };

/**
 * Full cart panel. Self-contained: bottom-sheet on mobile, side panel on wide
 * screens. Live subtotal, per-line qty + notes, order notes, optional pickup
 * time slot, and a WhatsApp CTA built via buildWhatsAppOrder (notes + schedule).
 *
 * Usage:
 *   <Cart />                      // manages its own open state via `count`
 *   <Cart open={x} onOpenChange/> // controlled
 */
export function Cart({
  open: controlledOpen,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const t = useTranslations("order");
  const locale = useLocale() as Locale;
  const site = useSiteConfig();

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const notes = useCart((s) => s.notes);
  const setNotes = useCart((s) => s.setNotes);
  const setLineNote = useCart((s) => s.setLineNote);
  const schedule = useCart((s) => s.schedule);
  const setSchedule = useCart((s) => s.setSchedule);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setUncontrolledOpen(v);
  };

  // Time slots resolved on the client after mount (SSR-safe).
  const [slots, setSlots] = useState<string[]>([]);
  useEffect(() => {
    // Intentional: time slots depend on the client's `new Date()`, which must
    // not run during SSR (would mismatch hydration). Resolved once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(suggestTimeSlots(new Date(), 6, 15));
  }, []);

  const opt = WHATSAPP_OPTS[locale];
  const href = useMemo(
    () =>
      buildWhatsAppOrder(
        site.whatsapp,
        lines.map((l) => ({
          name: l.name,
          qty: l.qty,
          price: l.price,
          note: l.note,
        })),
        site.brand,
        {
          notes: notes || undefined,
          schedule: schedule || undefined,
          greeting: opt.greeting,
          totalLabel: opt.total,
          notesLabel: opt.notes,
          scheduleLabel: opt.schedule,
        },
      ),
    [site.whatsapp, site.brand, lines, notes, schedule, opt],
  );

  const hasItems = lines.length > 0;

  return (
    <>
      <AnimatePresence>
        {open && hasItems && (
          <motion.div
            key="cart-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && hasItems && (
          <motion.aside
            key="cart-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[86vh] flex-col rounded-t-2xl border-t border-[var(--color-muted)]/20 bg-[var(--color-surface)] p-5 md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:max-h-none md:rounded-l-2xl md:rounded-tr-none md:border-l md:border-t-0"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">{t("title")}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="close"
                className="text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>

            <ul className="-mr-2 flex-1 divide-y divide-[var(--color-muted)]/15 overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li
                    key={l.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: EASE_ARR.soft }}
                    className="py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-medium">{l.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(l.id, l.qty - 1)}
                          aria-label="−"
                          className="h-7 w-7 rounded-[var(--radius)] border border-[var(--color-muted)]/30 transition hover:border-[var(--color-accent)]"
                        >
                          −
                        </button>
                        <span className="w-6 text-center tabular-nums">
                          {l.qty}
                        </span>
                        <button
                          onClick={() => setQty(l.id, l.qty + 1)}
                          aria-label="+"
                          className="h-7 w-7 rounded-[var(--radius)] border border-[var(--color-muted)]/30 transition hover:border-[var(--color-accent)]"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-20 text-right tabular-nums text-[var(--color-accent)]">
                        {((l.price * l.qty) / 100).toFixed(2)}€
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={l.note ?? ""}
                        onChange={(e) => setLineNote(l.id, e.target.value)}
                        placeholder={LINE_NOTE_PH[locale]}
                        className="flex-1 rounded-[var(--radius)] border border-transparent bg-[var(--color-bg)]/60 px-2.5 py-1.5 text-xs outline-none transition focus:border-[var(--color-accent)]/40"
                      />
                      <button
                        onClick={() => remove(l.id)}
                        className="text-xs text-[var(--color-muted)] underline-offset-2 transition hover:text-[var(--color-text)] hover:underline"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Time-slot picker (optional). */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {SCHEDULE_TITLE[locale]}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSchedule("")}
                  data-active={schedule === ""}
                  className="rounded-full border border-[var(--color-muted)]/30 px-3 py-1.5 text-xs transition data-[active=true]:border-transparent data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
                >
                  {ASAP_LABEL[locale]}
                </button>
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSchedule(s)}
                    data-active={schedule === s}
                    className="rounded-full border border-[var(--color-muted)]/30 px-3 py-1.5 text-xs tabular-nums transition data-[active=true]:border-transparent data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notes")}
              rows={2}
              className="mt-4 w-full rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent p-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[var(--color-muted)]">{t("subtotal")}</span>
              <motion.span
                key={subtotal}
                initial={{ scale: 1.18, color: "var(--color-accent)" }}
                animate={{ scale: 1, color: "var(--color-text)" }}
                transition={{ duration: 0.32, ease: EASE_ARR.back }}
                className="font-display text-2xl tabular-nums"
              >
                {(subtotal / 100).toFixed(2)}€
              </motion.span>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="sear-glow mt-4 block w-full rounded-[var(--radius)] bg-[var(--color-accent)] py-3.5 text-center font-semibold text-[var(--color-bg)] transition hover:brightness-110"
            >
              {t("whatsapp")} · {(subtotal / 100).toFixed(2)}€
            </a>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Self-managed trigger (only when uncontrolled). */}
      {controlledOpen === undefined && (
        <AnimatePresence>
          {count > 0 && !open && (
            <motion.button
              key="cart-fab"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setOpen(true)}
              className="sear-glow fixed inset-x-4 bottom-4 z-[55] flex items-center justify-between rounded-[var(--radius)] bg-[var(--color-accent)] px-5 py-4 font-semibold text-[var(--color-bg)] md:inset-x-auto md:right-6 md:w-96"
            >
              <span>{t("items", { count })}</span>
              <span className="tabular-nums">
                {(subtotal / 100).toFixed(2)}€ →
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
