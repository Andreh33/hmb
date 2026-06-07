"use client";

import type { HeroManifest, HeroMode } from "./manifest";
import { FrameScrub } from "./FrameScrub";
import { LayeredParallax } from "./LayeredParallax";
import { StillReveal } from "./StillReveal";
import { GlazeOverlay } from "./GlazeOverlay";

/**
 * Chooses the hero mode from manifest + experience preference, degrading to
 * 'still' if the required material is missing. Always renders the glaze overlay
 * on top (unless an experience opts out for its own fluid/particle treatment).
 */
export function HeroStage({
  manifest,
  prefer,
  glazeColor,
  glaze = true,
  explode,
  className,
}: {
  manifest: HeroManifest;
  prefer?: HeroMode;
  glazeColor: string;
  glaze?: boolean;
  explode?: number;
  className?: string;
}) {
  const mode = resolveMode(manifest, prefer);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {mode === "frames" && manifest.frames ? (
        <FrameScrub manifest={manifest} />
      ) : mode === "layered" && manifest.layers?.length ? (
        <LayeredParallax manifest={manifest} explode={explode} />
      ) : (
        <StillReveal manifest={manifest} />
      )}
      {glaze ? (
        <GlazeOverlay color={glazeColor} />
      ) : null}
    </div>
  );
}

function resolveMode(manifest: HeroManifest, prefer?: HeroMode): HeroMode {
  const want = prefer ?? manifest.mode;
  if (want === "frames" && manifest.frames) return "frames";
  if (want === "layered" && manifest.layers?.length) return "layered";
  return "still";
}
