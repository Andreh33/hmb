"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
  speed?: number;
}

/**
 * Ambient particle field — embers, dust, vapor. Instanced points, GPU-cheap.
 * Used for atmosphere across experiences (sparks in EMBER, vapor in NOVA).
 */
export function ParticleField({
  count = 600,
  color = "#E0992F",
  size = 0.025,
  spread = 8,
  speed = 0.15,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.sin(i * 12.9898) * 43758.5453) % 1 * spread - spread / 2;
      arr[i * 3 + 1] = ((Math.sin(i * 78.233) * 43758.5453) % 1) * spread - spread / 2;
      arr[i * 3 + 2] = ((Math.sin(i * 37.719) * 43758.5453) % 1) * spread - spread / 2;
    }
    return arr;
  }, [count, spread]);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    pts.rotation.y += delta * speed * 0.1;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const yi = i * 3 + 1;
      const cur = arr[yi] ?? 0;
      let next = cur + delta * speed;
      if (next > spread / 2) next = -spread / 2;
      arr[yi] = next;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
