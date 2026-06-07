"use client";

// SEAR — Branded loader + Canvas guard (§16).
// Two exports:
//   <BrandLoader/>   — the on-brand fallback shown while a 3D scene streams in
//                       (Suspense fallback) or as the resting visual on `lite`.
//   <CanvasGuard/>   — gates a three/R3F <Canvas> behind the device tier and
//                       wraps it in Suspense + the branded loader. If the tier
//                       forbids a canvas (lite), it renders `fallback` (or the
//                       BrandLoader) instead — never a blank or broken stage.

import { Suspense } from "react";
import { useTier } from "./Capability";

/**
 * Brand loader: a slow glaze sweep across the experience accent. Pure CSS, no
 * GPU, no layout shift — fills its parent. Reads experience tokens so it always
 * matches the active palette.
 */
export function BrandLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(120% 120% at 50% 30%, color-mix(in srgb, var(--surface) 70%, transparent), var(--bg))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "min(42%, 220px)",
          height: 2,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)",
          backgroundSize: "200% 100%",
          animation: "sear-glaze-sweep 1.4s ease-in-out infinite",
          boxShadow: "0 0 calc(var(--glow, 1) * 24px) var(--glaze)",
        }}
      />
      {label ? (
        <span
          style={{
            position: "absolute",
            bottom: "14%",
            fontFamily: "var(--body)",
            fontSize: 12,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--muted)",
            opacity: 0.7,
          }}
        >
          {label}
        </span>
      ) : null}
      <style>{`
        @keyframes sear-glaze-sweep {
          0%   { background-position: 200% 0; opacity: 0.4; }
          50%  { opacity: 1; }
          100% { background-position: -200% 0; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/**
 * Wraps a 3D scene so callers don't repeat the tier check + Suspense boilerplate.
 *
 * Usage:
 *   <CanvasGuard fallback={<HeroStill/>}>
 *     <Canvas>...</Canvas>
 *   </CanvasGuard>
 *
 * - tier.canvas3d === false  → renders `fallback` (the DOM-safe version) so the
 *   experience still looks intentional on weak/no-WebGL devices.
 * - otherwise                → renders `children` inside <Suspense> with the
 *   branded loader so the streaming canvas never shows a blank box.
 */
export function CanvasGuard({
  children,
  fallback,
  loaderLabel,
}: {
  children: React.ReactNode;
  /** DOM-only visual shown when the tier forbids a canvas. */
  fallback?: React.ReactNode;
  /** Optional caption under the brand loader while the canvas streams. */
  loaderLabel?: string;
}) {
  const tier = useTier();

  if (!tier.canvas3d) {
    return <>{fallback ?? <BrandLoader label={loaderLabel} />}</>;
  }

  return (
    <Suspense fallback={fallback ?? <BrandLoader label={loaderLabel} />}>
      {children}
    </Suspense>
  );
}
