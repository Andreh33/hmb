"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uShadow;
  uniform vec3 uHighlight;
  uniform float uIntensity;  // 0 = original image, 1 = full duotone
  uniform float uContrast;
  varying vec2 vUv;

  void main() {
    vec4 src = texture2D(uTex, vUv);
    // Perceptual luminance.
    float l = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
    // Contrast curve around mid-grey.
    l = clamp((l - 0.5) * uContrast + 0.5, 0.0, 1.0);
    vec3 duo = mix(uShadow, uHighlight, l);
    gl_FragColor = vec4(mix(src.rgb, duo, uIntensity), src.a);
  }
`;

export interface DuotoneProps {
  src: string;
  /** Dark-tone color (hex/css). */
  shadow?: string;
  /** Light-tone color (hex/css). */
  highlight?: string;
  /** 0 = original, 1 = full duotone. */
  intensity?: number;
  /** Tonal contrast before mapping. 1 = neutral. */
  contrast?: number;
  /** Reactive intensity; overrides static `intensity` when provided (RAF, no re-render). */
  intensityFn?: () => number;
}

/**
 * Duotone image shader — maps an image's luminance between two brand colors.
 * Editorial, on-brand stills (e.g. var(--color-bg) → var(--color-accent)).
 * Mount inside <FxCanvas>. Plane is unit-sized; scale the parent group/mesh
 * to the image aspect at the call site.
 */
export function Duotone({
  src,
  shadow = "#0a0805",
  highlight = "#E0992F",
  intensity = 1,
  contrast = 1.1,
  intensityFn,
}: DuotoneProps) {
  const tex = useLoader(THREE.TextureLoader, src);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uShadow: { value: new THREE.Color(shadow) },
      uHighlight: { value: new THREE.Color(highlight) },
      uIntensity: { value: intensity },
      uContrast: { value: contrast },
    }),
    // colors/intensity/contrast applied imperatively below to avoid remounting on tween
    [tex], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    (m.uniforms.uShadow!.value as THREE.Color).set(shadow);
    (m.uniforms.uHighlight!.value as THREE.Color).set(highlight);
    m.uniforms.uContrast!.value = contrast;
    m.uniforms.uIntensity!.value = intensityFn ? intensityFn() : intensity;
  });

  return (
    <mesh>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
