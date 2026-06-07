# perf — Capability tiers (§16)

Decides how much GPU work each experience is allowed to do on the current
device, so the **same layout renders everywhere** — only the realce (particles,
fluid, post-processing, render resolution) is dialed up or down. A blank or
broken stage is never an acceptable outcome.

## Files

- `capabilities.ts` — pure device probe: WebGPU (`'gpu' in navigator`), WebGL2,
  WebGL, `deviceMemory`, `hardwareConcurrency`, mobile + Safari heuristics, DPR.
  SSR-safe (`SSR_CAPABILITIES`).
- `useTier.ts` — pure `computeTier(caps) -> TierFlags` plus `useTierFrom(caps)`.
- `Capability.tsx` — `<CapabilityProvider>` probes once after hydration and
  caches it; `useTier()` (flags) and `useCapabilities()` (caps + tier + ready).
- `CanvasFallback.tsx` — `<BrandLoader/>` (on-brand CSS loader, no GPU) and
  `<CanvasGuard>` (tier gate + Suspense around a `<Canvas>`).

## Tiers

| Tier    | When                                               | canvas3d | particles | fluid | postfx | maxParticles | maxDpr |
|---------|----------------------------------------------------|----------|-----------|-------|--------|--------------|--------|
| `full`  | desktop, WebGL2/WebGPU, ≥8GB, multi-core           | yes      | yes       | yes   | yes    | 2500–4000    | ≤2     |
| `medio` | capable mobile / Safari / modest desktop           | yes      | yes       | no    | yes    | 400–900      | ≤1.5   |
| `lite`  | weak/low-RAM device, no WebGL2, or no WebGL at all  | maybe*   | no        | no    | no     | 0            | 1      |

\*`lite` only mounts a canvas on mid-mobile with WebGL2 and adequate RAM; truly
weak/no-WebGL devices stay **DOM-only**.

## How an experience must consume `useTier`

1. Wrap the app once in `<CapabilityProvider>` (integrator task — see below).
2. In each experience component, read the flags and branch:

```tsx
"use client";
import { useTier } from "@/shared/perf/Capability";
import { CanvasGuard, BrandLoader } from "@/shared/perf/CanvasFallback";

function EmberScene() {
  const { particles, fluid, postfx, maxParticles, maxDpr, fxScale } = useTier();

  return (
    <CanvasGuard fallback={<HeroStillDOM />} loaderLabel="EMBER">
      <Canvas dpr={[1, maxDpr]}>
        {/* Hero is ALWAYS the manifest image (§5) — never modeled food. */}
        {particles && <ParticleField count={maxParticles} />}
        {fluid && <FluidSim />}
        {postfx && <PostFX bloom={0.4 * fxScale} chroma={0.6 * fxScale} grain={0.2 * fxScale} />}
      </Canvas>
    </CanvasGuard>
  );
}
```

### Rules of degradation
- **Hero never disappears.** The manifest image (`HeroStage`) is DOM/`<img>`
  based; only the 3D realce around it is gated. On `lite` with no canvas, render
  the still hero + CSS glaze and skip the `<Canvas>` entirely.
- **Gate, don't crash.** Always pass a `fallback` to `CanvasGuard` that is a
  visually intentional DOM version, not an empty div.
- **Cap, don't disable, when possible.** Prefer lowering `maxParticles` /
  `maxDpr` / `fxScale` over removing a feature, so `medio` still feels alive.
- **Order of expense:** `fluid` (heaviest) → `postfx` → `particles`. `lite`
  drops all three; `medio` keeps particles + light post; `full` runs everything.
- **Read flags at render**, not in a RAF loop. The flags are stable for the
  session (probe runs once), so branching on them won't thrash.
- This module does **not** handle reduced-motion (out of scope).

## Cross-cutting request to the integrator

`<CapabilityProvider>` must wrap the app **above** the experiences — ideally
just inside `ExperienceProvider` in the root layout / providers tree — so every
experience and shared fx component can call `useTier()`. Before it mounts,
`useTier()` returns the SSR/`lite` baseline (safe, DOM-only), so nothing breaks
if it is omitted, but real device detection requires the provider.
