"use client";

import { forwardRef, useMemo } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  ToneMapping,
  DepthOfField,
  GodRays,
} from "@react-three/postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { BlendFunction, Effect, ToneMappingMode } from "postprocessing";
import type { Mesh, Points } from "three";
import { Uniform } from "three";

/* -------------------------------------------------------------------------- */
/*  LensDistortion — custom barrel/pincushion + subtle chromatic edge.        */
/*  Not shipped by @react-three/postprocessing, so we build it on the Effect  */
/*  base class and expose it through wrapEffect (real, current API).          */
/* -------------------------------------------------------------------------- */

const lensDistortionFrag = /* glsl */ `
  uniform float uDistortion;
  uniform float uPrincipal;

  void mainUv(inout vec2 uv) {
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    // Brown–Conrady style radial distortion; positive = barrel, negative = pincushion.
    float f = 1.0 + r2 * (uDistortion + uPrincipal * r2);
    uv = c * f + 0.5;
  }
`;

class LensDistortionEffectImpl extends Effect {
  constructor({ distortion = 0.12, principal = 0.06 }: { distortion?: number; principal?: number } = {}) {
    super("LensDistortionEffect", lensDistortionFrag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uDistortion", new Uniform(distortion)],
        ["uPrincipal", new Uniform(principal)],
      ]),
    });
  }
}

const LensDistortion = wrapEffect(LensDistortionEffectImpl as never);

/* -------------------------------------------------------------------------- */
/*  Film grade options                                                         */
/* -------------------------------------------------------------------------- */

export type Grade = "none" | "aces" | "agx" | "neutral";

const GRADE_MODE: Record<Exclude<Grade, "none">, ToneMappingMode> = {
  aces: ToneMappingMode.ACES_FILMIC,
  agx: ToneMappingMode.AGX,
  neutral: ToneMappingMode.NEUTRAL,
};

export interface PostFXProps {
  bloom?: number;
  vignette?: boolean;
  chroma?: number;
  grain?: number;
  /** Film tonemap. "agx" = creamy highlights, "aces" = punchy filmic. */
  grade?: Grade;
  /** Barrel-lens curvature for the whole frame. 0 disables. */
  lensDistortion?: number;
  /** Depth of field. Pass focusDistance (0..1) + bokehScale, or `true` for defaults. */
  dof?: boolean | { focusDistance?: number; focalLength?: number; bokehScale?: number };
  /** GodRays anchored to a mesh/points ref (e.g. the hero key light). Optional. */
  godRaysSun?: React.RefObject<Mesh | Points | null> | null;
  godRays?: { density?: number; decay?: number; weight?: number; exposure?: number; samples?: number };
}

/**
 * Shared post-processing stack. Each experience activates the subset it needs.
 * Order matters: tonemap/grade first → optical (DOF, godrays, lens) → bloom →
 * chroma → grain → vignette, so grain/vignette sit on top of the graded image.
 */
export function PostFX({
  bloom = 0.4,
  vignette = true,
  chroma = 0,
  grain = 0,
  grade = "none",
  lensDistortion = 0,
  dof = false,
  godRaysSun = null,
  godRays,
}: PostFXProps) {
  const dofProps = useMemo(() => {
    if (!dof) return null;
    if (dof === true) return { focusDistance: 0.02, focalLength: 0.05, bokehScale: 3 };
    return {
      focusDistance: dof.focusDistance ?? 0.02,
      focalLength: dof.focalLength ?? 0.05,
      bokehScale: dof.bokehScale ?? 3,
    };
  }, [dof]);

  return (
    <EffectComposer>
      <>
        {grade !== "none" ? <ToneMapping mode={GRADE_MODE[grade]} /> : <></>}

        {dofProps ? (
          <DepthOfField
            focusDistance={dofProps.focusDistance}
            focalLength={dofProps.focalLength}
            bokehScale={dofProps.bokehScale}
          />
        ) : (
          <></>
        )}

        {godRaysSun && godRaysSun.current ? (
          <GodRays
            sun={godRaysSun as React.RefObject<Mesh | Points>}
            samples={godRays?.samples ?? 60}
            density={godRays?.density ?? 0.96}
            decay={godRays?.decay ?? 0.92}
            weight={godRays?.weight ?? 0.4}
            exposure={godRays?.exposure ?? 0.5}
            clampMax={1}
            blur
          />
        ) : (
          <></>
        )}

        {bloom > 0 ? (
          <Bloom
            intensity={bloom}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
        ) : (
          <></>
        )}

        {lensDistortion !== 0 ? (
          <LensDistortion distortion={lensDistortion} principal={lensDistortion * 0.5} />
        ) : (
          <></>
        )}

        {chroma > 0 ? (
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[chroma * 0.002, chroma * 0.002]}
            radialModulation={false}
            modulationOffset={0}
          />
        ) : (
          <></>
        )}

        {grain > 0 ? (
          <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={grain} />
        ) : (
          <></>
        )}

        {vignette ? <Vignette eskil={false} offset={0.25} darkness={0.7} /> : <></>}
      </>
    </EffectComposer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Presets per feel — drop-in PostFX configs that match each experience mood.*/
/* -------------------------------------------------------------------------- */

export type PostFXFeel = "ember" | "nova" | "prime" | "clean";

export const POSTFX_PRESETS: Record<PostFXFeel, PostFXProps> = {
  // EMBER — warm, charred, smoky. Filmic punch + heavy grain + lens curve.
  ember: { grade: "aces", bloom: 0.55, vignette: true, chroma: 0.6, grain: 0.06, lensDistortion: 0.08 },
  // NOVA — clinical neon, creamy highlights, airy bloom, almost no grain.
  nova: { grade: "agx", bloom: 0.7, vignette: true, chroma: 0.3, grain: 0.02, dof: true },
  // PRIME — editorial, restrained, glossy. Neutral tonemap, light vignette.
  prime: { grade: "neutral", bloom: 0.35, vignette: true, chroma: 0, grain: 0.03 },
  // CLEAN — near-transparent pass; just a touch of tonemap + vignette.
  clean: { grade: "agx", bloom: 0.2, vignette: true, chroma: 0, grain: 0 },
};

/**
 * <PostFXPreset feel="ember" /> — convenience wrapper. Any prop overrides the
 * preset, so you can e.g. <PostFXPreset feel="nova" godRaysSun={sunRef} />.
 */
export const PostFXPreset = forwardRef<null, { feel: PostFXFeel } & Partial<PostFXProps>>(
  function PostFXPreset({ feel, ...overrides }, _ref) {
    void _ref;
    return <PostFX {...POSTFX_PRESETS[feel]} {...overrides} />;
  },
);
