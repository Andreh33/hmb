"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

const KEY = "sear_cookie_consent";

export function CookieBanner() {
  const t = useTranslations("legal");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const decide = (value: "accept" | "reject") => {
    localStorage.setItem(KEY, value);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-[var(--radius)] border border-[var(--color-muted)]/20 bg-[var(--color-surface)] p-5 shadow-2xl"
        >
          <h4 className="font-display text-lg">{t("cookiesTitle")}</h4>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t("cookiesBody")}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => decide("accept")}
              className="rounded-[var(--radius)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)]"
            >
              {t("accept")}
            </button>
            <button
              onClick={() => decide("reject")}
              className="rounded-[var(--radius)] border border-[var(--color-muted)]/30 px-4 py-2 text-sm"
            >
              {t("reject")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
