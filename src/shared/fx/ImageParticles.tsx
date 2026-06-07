"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScroll } from "@/shared/scroll/scroll-store";

export interface ImageParticlesProps {
  src: string;
  count?: number;
  progress?: () => number;
  /** WebGPU path is added by A-NOVA; this WebGL2 instanced fallback always works. */
  webgpu?: boolean;
  pointSize?: number;
}

interface Sampled {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}

/**
 * Samples an image into ~count particles, each colored by its pixel. progress
 * drives dispersion ↔ recomposition. NO mesh — the photorealistic burger
 * disintegrates and reforms. WebGL2 instanced fallback (NOVA flagship effect).
 */
export function ImageParticles({
  src,
  count = 40000,
  progress,
  pointSize = 0.012,
}: ImageParticlesProps) {
  const [sampled, setSampled] = useState<Sampled | null>(null);
  const pts = useRef<THREE.Points>(null);
  const scatter = useRef<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      const side = Math.max(64, Math.floor(Math.sqrt(count)));
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, side, side);
      const data = ctx.getImageData(0, 0, side, side).data;
      const n = side * side;
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const scatterArr = new Float32Array(n * 3);
      const aspect = img.width / img.height || 1;
      for (let i = 0; i < n; i++) {
        const x = i % side;
        const y = Math.floor(i / side);
        positions[i * 3] = (x / side - 0.5) * aspect;
        positions[i * 3 + 1] = -(y / side - 0.5);
        positions[i * 3 + 2] = 0;
        const di = i * 4;
        colors[i * 3] = (data[di] ?? 0) / 255;
        colors[i * 3 + 1] = (data[di + 1] ?? 0) / 255;
        colors[i * 3 + 2] = (data[di + 2] ?? 0) / 255;
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const b = Math.sin(i * 78.233) * 43758.5453;
        scatterArr[i * 3] = ((a % 1) - 0.5) * 4;
        scatterArr[i * 3 + 1] = ((b % 1) - 0.5) * 4;
        scatterArr[i * 3 + 2] = (((a * b) % 1) - 0.5) * 4;
      }
      scatter.current = scatterArr;
      setSampled({ positions, colors, count: n });
    };
    return () => {
      cancelled = true;
    };
  }, [src, count]);

  const base = useMemo(
    () => sampled?.positions.slice() ?? null,
    [sampled],
  );

  useFrame(() => {
    const p = pts.current;
    if (!p || !sampled || !base || !scatter.current) return;
    const prog = progress ? progress() : getScroll().progress;
    // 0 = reformed, 1 = fully dispersed. Use a bell so it reforms at the ends.
    const disperse = Math.sin(prog * Math.PI);
    const attr = p.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < sampled.count * 3; i++) {
      arr[i] = (base[i] ?? 0) + (scatter.current[i] ?? 0) * disperse;
    }
    attr.needsUpdate = true;
  });

  if (!sampled) return null;

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[sampled.positions, 3]}
          count={sampled.count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[sampled.colors, 3]}
          count={sampled.count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        sizeAttenuation
        transparent
        depthWrite={false}
      />
    </points>
  );
}
