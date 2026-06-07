"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CapabilityProvider, useTier } from "@/shared/perf/Capability";
import { SiteHeader } from "@/shared/ui/SiteHeader";
import { OrderBar } from "@/shared/convert/OrderBar";
import {
  AURORA_BACKDROP,
  AURORA_DRIFT,
  FILM_GRAIN,
  NOVA_KEYFRAMES,
} from "./art";
import { NovaHero } from "./Hero";
import { NovaForge } from "./sections/Forge";
import {
  NovaFooter,
  NovaLocation,
  NovaMenu,
  NovaStory,
} from "./sections/Stations";

// The WebGL cloud is heavy and browser-only — lazy, never SSR'd. The page is
// fully usable (and indexable) without it; the canvas is pure realce.
const NovaScene = dynamic(
  () => import("./sections/NovaScene").then((m) => m.NovaScene),
  { ssr: false },
);

/**
 * NOVA — Immersive Particle Showpiece.
 *
 * A single persistent particle canvas lives behind the whole page. The hero
 * photo coalesces from ~100k particles, the user orbits the cloud (drag), and
 * the scroll acts as a layered camera that bursts/recomposes the cloud between
 * five "stations". Real DOM text floats over the canvas (indexable + a11y).
 *
 * Tier-aware (consumes useTier): full → dense WebGPU/WebGL2 cloud + PostFX,
 * medio → sparser cloud, lite → no canvas, just the CSS aurora + parallax DOM.
 * The layout is identical across tiers — only GPU effects degrade.
 */
/**
 * Injects the NOVA-only keyframes once at the document level. The experience
 * must not edit the root globals.css, so we own a single, idempotent <style>
 * tag keyed by id — mounting NOVA twice (HMR, remount) never duplicates it.
 */
function useNovaKeyframes() {
  useEffect(() => {
    const id = "nova-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = NOVA_KEYFRAMES;
    document.head.appendChild(style);
  }, []);
}

function NovaInner() {
  const tier = useTier();
  useNovaKeyframes();
  const [orbitPad, setOrbitPad] = useState<HTMLDivElement | null>(null);
  const handleOrbitPad = useCallback((el: HTMLDivElement | null) => {
    setOrbitPad(el);
  }, []);

  return (
    <main
      className="relative min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* Procedural volumetric backdrop — always on, even on the lite tier. */}
      <div style={AURORA_BACKDROP} aria-hidden />
      {/* Slow drifting aurora so the backdrop breathes (respects reduced-motion). */}
      <div className="nova-anim" style={AURORA_DRIFT} aria-hidden />

      {/* The persistent particle cloud (only when the device can take it). */}
      {tier.canvas3d ? (
        <NovaScene tier={tier} orbitTarget={orbitPad} />
      ) : null}

      {/* Header reused from shared; brand/lang/experience toggle intact. */}
      <SiteHeader />

      {/* Stations — DOM floats over the canvas (zIndex >= 2 on each section). */}
      <NovaHero onOrbitPad={handleOrbitPad} />
      <NovaMenu />
      <NovaForge />
      <NovaStory />
      <NovaLocation />
      <NovaFooter />

      {/* Conversion bar (shared contract, unchanged). */}
      <OrderBar />

      {/* Film grain over everything — unifies DOM + canvas under one texture. */}
      <div className="nova-anim" style={FILM_GRAIN} aria-hidden />
    </main>
  );
}

export default function NovaExperience() {
  // Self-contained capability detection so useTier resolves correctly here even
  // if the app root hasn't mounted a CapabilityProvider. Idempotent + cached.
  return (
    <CapabilityProvider>
      <NovaInner />
    </CapabilityProvider>
  );
}
