"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FxCanvas } from "@/shared/fx/Canvas";
import { ParticleField } from "@/shared/fx/ParticleField";
import { PostFX } from "@/shared/fx/postfx";
import { getActProgress } from "./scroll";

/**
 * Two ember layers (near, fast warm cinders + far, slow gold dust) drifting up,
 * graded with the EMBER PostFX preset (filmic ACES + bloom + grain + vignette +
 * subtle lens curve). The whole field gathers toward centre as the montage
 * assembles (act progress), giving the embers a sense of being drawn up by the
 * heat of the building burger.
 */
function Embers() {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = getActProgress("montage");
    // Pull the field in slightly + lift as the burger assembles.
    const s = 1.05 - p * 0.12;
    g.scale.setScalar(s);
    g.position.y = -0.3 + p * 0.6;
  });
  return (
    <group ref={group}>
      <ParticleField count={420} color="#FFC25A" size={0.03} spread={9} speed={0.22} />
      <ParticleField count={260} color="#8C1C13" size={0.018} spread={11} speed={0.12} />
    </group>
  );
}

export function EmberSparksScene() {
  return (
    <FxCanvas dprRange={[1, 1.75]} camera={{ fov: 38, position: [0, 0, 6] }}>
      <Embers />
      <PostFX grade="aces" bloom={0.6} vignette chroma={0.5} grain={0.06} lensDistortion={0.07} />
    </FxCanvas>
  );
}
