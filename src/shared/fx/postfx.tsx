"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export interface PostFXProps {
  bloom?: number;
  vignette?: boolean;
  chroma?: number;
  grain?: number;
}

/**
 * Shared post-processing stack. Each experience activates the subset it needs.
 * A-FX deepens this (GodRays, DOF, LensDistortion, ACES/AgX grade).
 */
export function PostFX({
  bloom = 0.4,
  vignette = true,
  chroma = 0,
  grain = 0,
}: PostFXProps) {
  return (
    <EffectComposer>
      <>
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
