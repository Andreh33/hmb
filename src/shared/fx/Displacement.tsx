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
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

  void main(){
    // Noise-driven displacement reveal.
    float n = hash(floor(vUv * 12.0));
    vec2 uv = vUv + (n - 0.5) * (1.0 - uProgress) * 0.12;
    vec4 col = texture2D(uTex, uv);
    float reveal = smoothstep(n - 0.15, n + 0.15, uProgress);
    gl_FragColor = vec4(col.rgb, col.a * reveal);
  }
`;

/**
 * Image reveal / transition by noise displacement. Used by StillReveal and
 * PRIME's section transitions. Driven by global scroll progress by default.
 */
export function DisplacementImage({
  src,
  progress,
}: {
  src: string;
  progress?: () => number;
}) {
  const tex = useLoader(THREE.TextureLoader, src);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    }),
    [tex],
  );

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime!.value += delta;
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
