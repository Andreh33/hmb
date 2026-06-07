"use client";

// SEAR — Capability provider/context (§16).
// Detects device capabilities ONCE after hydration and exposes both the raw
// caps and the derived tier flags. Before detection completes it serves the
// SSR-safe baseline (lite, DOM-only) so the server and first client render
// agree — no hydration mismatch, no flash of an effect the device can't run.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type Capabilities,
  detectCapabilities,
  SSR_CAPABILITIES,
} from "./capabilities";
import { computeTier, SSR_TIER, type TierFlags } from "./useTier";

interface CapabilityContextValue {
  caps: Capabilities;
  tier: TierFlags;
  /** False until the post-hydration probe has run. */
  ready: boolean;
}

const CapabilityContext = createContext<CapabilityContextValue | null>(null);

/** Module-level cache so remounts don't re-probe the GPU. */
let cachedCaps: Capabilities | null = null;

export function CapabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start from the SSR baseline so the first client render matches the server.
  const [caps, setCaps] = useState<Capabilities>(
    cachedCaps ?? SSR_CAPABILITIES,
  );
  const [ready, setReady] = useState<boolean>(cachedCaps != null);

  useEffect(() => {
    // Intentional: device capabilities are probed from browser-only APIs after
    // mount (SSR baseline first to match the server render), then committed once.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (cachedCaps) {
      // Already probed in a previous mount this session.
      setCaps(cachedCaps);
      setReady(true);
      return;
    }
    const probed = detectCapabilities();
    cachedCaps = probed;
    setCaps(probed);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const value = useMemo<CapabilityContextValue>(() => {
    const tier = ready ? computeTier(caps) : SSR_TIER;
    return { caps, tier, ready };
  }, [caps, ready]);

  // Expose the resolved tier on the root element for CSS/debugging hooks.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.tier = value.tier.tier;
  }, [ready, value.tier.tier]);

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  );
}

/**
 * Primary consumer hook. Returns the live tier flags. Safe outside the provider
 * (falls back to the SSR/lite baseline) so isolated components never crash —
 * but wrap the app in <CapabilityProvider> to get real device detection.
 */
export function useTier(): TierFlags {
  const ctx = useContext(CapabilityContext);
  return ctx ? ctx.tier : SSR_TIER;
}

/** Full context (caps + tier + ready) for code that needs the raw signals. */
export function useCapabilities(): CapabilityContextValue {
  const ctx = useContext(CapabilityContext);
  if (!ctx) {
    return { caps: SSR_CAPABILITIES, tier: SSR_TIER, ready: false };
  }
  return ctx;
}
