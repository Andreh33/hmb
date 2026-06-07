"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  acceptAll,
  hasDecided,
  rejectAll,
  setConsent,
  getConsent,
} from "./consent";

/**
 * Dispatch this event anywhere (e.g. a "Manage cookies" link in the footer or
 * the cookie policy) to re-open the banner so users can change their choice.
 *   window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT))
 */
export const REOPEN_CONSENT_EVENT = "sear:consent-open";

export function CookieBanner() {
  const t = useTranslations("legal");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // Show only if the user has not decided yet. Hydration-safe: starts closed.
  useEffect(() => {
    // Intentional: localStorage is client-only, so consent state can only be
    // read after mount. Starts closed for hydration safety, then syncs once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!hasDecided()) setOpen(true);
    const current = getConsent();
    setAnalytics(current.analytics);
    setMarketing(current.marketing);
  }, []);

  // Allow re-opening from elsewhere (footer link, policy page).
  useEffect(() => {
    const reopen = () => {
      const current = getConsent();
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
      setExpanded(true);
      setOpen(true);
    };
    window.addEventListener(REOPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, reopen);
  }, []);

  // Move focus into the dialog when it opens (accessibility).
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const onAcceptAll = useCallback(() => {
    acceptAll();
    close();
  }, [close]);

  const onRejectAll = useCallback(() => {
    rejectAll();
    close();
  }, [close]);

  const onSavePreferences = useCallback(() => {
    setConsent({ analytics, marketing });
    close();
  }, [analytics, marketing, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-muted)_25%,transparent)] bg-[var(--color-surface)]/95 p-5 shadow-2xl backdrop-blur-md outline-none sm:inset-x-4 sm:bottom-4 sm:p-6"
        >
          <h2
            id={titleId}
            className="font-display text-lg tracking-tight sm:text-xl"
          >
            {t("cookiesTitle")}
          </h2>
          <p
            id={descId}
            className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]"
          >
            {t("cookiesBody")}{" "}
            <Link
              href="/cookies"
              className="underline decoration-[var(--color-accent)] underline-offset-2 hover:text-[var(--color-text)]"
            >
              {t("cookiesPolicyLink")}
            </Link>
          </p>

          {/* Granular preferences */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3 text-xs font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {expanded ? t("hidePreferences") : t("managePreferences")}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.fieldset
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3 overflow-hidden border-0 p-0"
              >
                <legend className="sr-only">{t("preferencesLegend")}</legend>

                <ConsentRow
                  label={t("catNecessaryTitle")}
                  description={t("catNecessaryBody")}
                  checked
                  disabled
                  alwaysOnLabel={t("alwaysOn")}
                />
                <ConsentRow
                  label={t("catAnalyticsTitle")}
                  description={t("catAnalyticsBody")}
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <ConsentRow
                  label={t("catMarketingTitle")}
                  description={t("catMarketingBody")}
                  checked={marketing}
                  onChange={setMarketing}
                />
              </motion.fieldset>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-[var(--radius)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-muted)_35%,transparent)] px-4 py-2 text-sm transition-colors hover:border-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {t("reject")}
            </button>
            {expanded && (
              <button
                type="button"
                onClick={onSavePreferences}
                className="rounded-[var(--radius)] border border-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                {t("savePreferences")}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConsentRow({
  label,
  description,
  checked,
  disabled,
  alwaysOnLabel,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  alwaysOnLabel?: string;
  onChange?: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 border-t border-[color-mix(in_srgb,var(--color-muted)_15%,transparent)] py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      </div>
      {disabled ? (
        <span className="shrink-0 select-none rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          {alwaysOnLabel}
        </span>
      ) : (
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
        />
      )}
    </div>
  );
}
