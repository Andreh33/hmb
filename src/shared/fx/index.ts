/**
 * fx barrel — the shared R3F effects library.
 *
 * SSR NOTE: every component here is a "use client" module that mounts an R3F
 * scene (or must live inside one). They are browser-only. When a *page/section*
 * embeds a heavy fx scene, lazy-load the wrapper with:
 *
 *   const Scene = dynamic(() => import("@/shared/fx/...").then(m => m.X), { ssr: false });
 *
 * Importing types/presets from this barrel is always SSR-safe (no side effects).
 */

export { FxCanvas } from "./Canvas";
export type { FxCanvasProps } from "./Canvas";

export {
  PostFX,
  PostFXPreset,
  POSTFX_PRESETS,
} from "./postfx";
export type { PostFXProps, PostFXFeel, Grade } from "./postfx";

export { ParticleField } from "./ParticleField";
export type { ParticleFieldProps } from "./ParticleField";

export { DisplacementImage } from "./Displacement";
export type { DisplacementImageProps, RevealDirection } from "./Displacement";

export { ImageParticles } from "./ImageParticles";
export type { ImageParticlesProps } from "./ImageParticles";

export { FluidSim, FluidSimPrime } from "./FluidSim";
export type { FluidSimProps } from "./FluidSim";

export { Duotone } from "./Duotone";
export type { DuotoneProps } from "./Duotone";
