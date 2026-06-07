"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const frag = /* glsl */ `
  uniform vec2 uMouse;
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main(){
    float d = distance(vUv, uMouse);
    float ripple = sin(d * 30.0 - uTime * 3.0) * exp(-d * 6.0);
    float glow = smoothstep(0.4, 0.0, d) * 0.5 + ripple * 0.5;
    gl_FragColor = vec4(uColor * glow, glow);
  }
`;
const vert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

/**
 * Pointer-reactive fluid-style overlay (ping-pong FBO sim deepened by A-FX for
 * PRIME). This baseline gives reactive ripples/glaze that always compiles.
 */
export function FluidSim({ color = "#C98A3E" }: { color?: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
    }),
    [color],
  );

  useFrame(({ pointer, clock }) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime!.value = clock.elapsedTime;
    const mouse = m.uniforms.uMouse!.value as THREE.Vector2;
    mouse.lerp(
      new THREE.Vector2((pointer.x + 1) / 2, (pointer.y + 1) / 2),
      0.08,
    );
  });

  void size;

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
