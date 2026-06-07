// Cookie consent — single source of truth (RGPD/LOPDGDD, AEPD guidance).
//
// Categories:
//   - necessary: always on, cannot be disabled (technical/functional).
//   - analytics: opt-in (e.g. measurement).
//   - marketing: opt-in (e.g. remarketing / ad pixels).
//
// THIRD PARTIES MUST NOT LOAD before the user grants the relevant category.
// Read consent with getConsent()/hasConsent(); react to changes with
// onConsentChange(). Persisted in localStorage so the choice survives reloads.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  /** Always true; surfaced for completeness so callers can iterate categories. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** Schema version — bump to re-prompt when the cookie inventory changes. */
  v: number;
  /** ISO timestamp of the decision (proof of consent). */
  ts: string;
}

export const CONSENT_KEY = "sear_cookie_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "sear:consent";

const DEFAULT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  v: CONSENT_VERSION,
  ts: "",
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

/** Returns the stored decision, or null if the user has not decided yet. */
export function getStoredConsent(): ConsentState | null {
  if (!isClient()) return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    // Re-prompt if the schema version changed.
    if (parsed.v !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      v: CONSENT_VERSION,
      ts: typeof parsed.ts === "string" ? parsed.ts : "",
    };
  } catch {
    return null;
  }
}

/** Current consent, falling back to the safe default (everything off). */
export function getConsent(): ConsentState {
  return getStoredConsent() ?? DEFAULT;
}

/** True if the given non-necessary category is currently granted. */
export function hasConsent(category: Exclude<ConsentCategory, "necessary">): boolean {
  if (category === "analytics") return getConsent().analytics;
  return getConsent().marketing;
}

/** True once the user has made any explicit choice (banner should be hidden). */
export function hasDecided(): boolean {
  return getStoredConsent() !== null;
}

/** Persists a decision and broadcasts it to listeners (same + other tabs). */
export function setConsent(partial: {
  analytics: boolean;
  marketing: boolean;
}): ConsentState {
  const next: ConsentState = {
    necessary: true,
    analytics: partial.analytics,
    marketing: partial.marketing,
    v: CONSENT_VERSION,
    ts: new Date().toISOString(),
  };
  if (isClient()) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode / blocked) — keep in-memory only */
    }
    window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: next }));
  }
  return next;
}

/** Convenience: grant everything. */
export function acceptAll(): ConsentState {
  return setConsent({ analytics: true, marketing: true });
}

/** Convenience: reject all optional categories (necessary stays on). */
export function rejectAll(): ConsentState {
  return setConsent({ analytics: false, marketing: false });
}

/**
 * Subscribe to consent changes. Fires on setConsent() in this tab and on the
 * localStorage `storage` event from other tabs. Returns an unsubscribe fn.
 */
export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  if (!isClient()) return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail;
    cb(detail ?? getConsent());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) cb(getConsent());
  };
  window.addEventListener(CONSENT_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
