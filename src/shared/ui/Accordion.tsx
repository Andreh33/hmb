"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_ARR } from "@/shared/motion/easings";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/**
 * Accessible accordion (button + region, aria-expanded). Height auto-animates
 * via Motion; single-open by default, optional multi. Keyboard native.
 */
export function Accordion({
  items,
  allowMultiple = false,
  className = "",
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string[]>(items[0] ? [items[0].id] : []);

  function toggle(id: string) {
    setOpen((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : allowMultiple
          ? [...cur, id]
          : [id],
    );
  }

  return (
    <div className={`divide-y divide-[var(--color-muted)]/15 border-y border-[var(--color-muted)]/15 ${className}`}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-${it.id}`}
                onClick={() => toggle(it.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-lg outline-none transition-colors hover:text-[var(--color-accent)] focus-visible:text-[var(--color-accent)]"
              >
                {it.title}
                <motion.span
                  aria-hidden
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_ARR.lux }}
                  className="text-[var(--color-accent)]"
                >
                  +
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`acc-${it.id}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.34, ease: EASE_ARR.lux }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-[var(--color-muted)]">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
