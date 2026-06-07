"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_ARR } from "@/shared/motion/easings";

export interface OverlayLink {
  label: string;
  href: string;
}

/**
 * A full-screen overlay navigation that wipes in with a clip reveal and
 * staggers its links up from below. Traps Escape to close; locks scroll.
 */
export function OverlayMenu({
  open,
  onClose,
  links,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  links: OverlayLink[];
  footer?: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[100] flex flex-col bg-[var(--color-bg)]"
          initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
          animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
          exit={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", opacity: reduce ? 0 : 1 }}
          transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE_ARR.lux }}
        >
          <div className="flex items-center justify-end p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--color-muted)]/30 px-5 py-2 text-sm uppercase tracking-widest outline-none transition hover:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-text)]"
            >
              Cerrar
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-8 md:px-16">
            {links.map((l, i) => (
              <span key={l.href} className="overflow-hidden">
                <motion.a
                  href={l.href}
                  className="block font-display text-5xl leading-tight text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)] md:text-8xl"
                  initial={{ y: reduce ? 0 : "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, ease: EASE_ARR.lux, delay: 0.15 + i * 0.07 }}
                >
                  {l.label}
                </motion.a>
              </span>
            ))}
          </nav>
          {footer && (
            <div className="border-t border-[var(--color-muted)]/15 px-8 py-6 text-[var(--color-muted)] md:px-16">
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
