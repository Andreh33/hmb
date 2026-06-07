"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { getScroll } from "@/shared/scroll/scroll-store";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uProgress;
  uniform float uTime;
  uniform float uScale;        // noise frequency
  uniform vec2  uDir;          // sweep direction (normalized), (0,0) = pure noise
  varying vec2 vUv;

  // Value noise.
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main(){
    float n = noise(vUv * uScale + uTime * 0.05);
    // Directional bias: reveal sweeps along uDir, modulated by noise for an organic edge.
    float along = dot(vUv - 0.5, uDir) + 0.5;       // 0..1 across the chosen axis
    float field = mix(n, along, clamp(length(uDir), 0.0, 1.0));

    // Liquid displacement that settles as progress -> 1.
    vec2 disp = (vec2(n, noise(vUv.yx * uScale)) - 0.5) * (1.0 - uProgress) * 0.12;
    vec4 col = texture2D(uTex, vUv + disp);

    float edge = 0.18;
    float reveal = smoothstep(field - edge, field + edge, uProgress);
    gl_FragColor = vec4(col.rgb, col.a * reveal);
  }
`;

export type RevealDirection = "noise" | "up" | "down" | "left" | "right";

const DIR_VEC: Record<RevealDirection, [number, number]> = {
  noise: [0, 0],
  up: [0, 1],
  down: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};

export interface DisplacementImageProps {
  src: string;
  progress?: () => number;
  /** How the reveal travels: organic noise blobs, or a directional sweep. */
  direction?: RevealDirection;
  /** Noise frequency — small = big soft blobs, large = fine speckle. */
  scale?: number;
}

/**
 * Image reveal / transition by noise displacement. Used by StillReveal and
 * PRIME's section transitions. Driven by global scroll progress by default.
 * `direction` chooses an organic blob reveal or a directional liquid wipe;
 * `scale` tunes the noise grain.
 */
export function DisplacementImage({
  src,
  progress,
  direction = "noise",
  scale = 12,
}: DisplacementImageProps) {
  const tex = useLoader(THREE.TextureLoader, src);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const dir = DIR_VEC[direction];
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uScale: { value: scale },
      uDir: { value: new THREE.Vector2(dir[0], dir[1]) },
    }),
    // dir/scale applied imperatively to avoid remount on prop tween
    [tex], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime!.value += delta;
    m.uniforms.uScale!.value = scale;
    (m.uniforms.uDir!.value as THREE.Vector2).set(dir[0], dir[1]);
    m.uniforms.uProgress!.value = progress ? progress() : getScroll().progress;
  });

  return (
    <mesh>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
