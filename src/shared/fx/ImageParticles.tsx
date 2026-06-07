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
  /** Curl-noise turbulence amplitude during dispersion. 0 = pure radial scatter. */
  turbulence?: number;
}

interface Sampled {
  positions: Float32Array;
  colors: Float32Array;
  scatter: Float32Array;
  count: number;
}

const _color = new THREE.Color();
const _mat = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3(1, 1, 1);

/** Deterministic hash in [0,1). */
function rand(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1;
}

/**
 * Samples an image into ~count particles, each colored by its pixel. progress
 * drives dispersion ↔ recomposition with a smooth bell (reformed at both ends).
 * NO mesh — the photorealistic burger disintegrates and reforms.
 *
 * Sampling now SUBSAMPLES to the target `count`: we read a high-res grid for
 * color fidelity, then stride down to exactly the requested particle budget so
 * `count` is a real perf dial (not just sqrt-rounded). Rendered as an
 * InstancedMesh (one tiny quad per particle) for GPU-cheap, per-instance color.
 */
export function ImageParticles({
  src,
  count = 40000,
  progress,
  pointSize = 0.012,
  turbulence = 0.6,
}: ImageParticlesProps) {
  const [sampled, setSampled] = useState<Sampled | null>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      // Read a generous source grid for color fidelity (cap to keep memory sane).
      const target = Math.max(1, Math.floor(count));
      const srcSide = Math.min(512, Math.max(64, Math.ceil(Math.sqrt(target * 2))));
      const canvas = document.createElement("canvas");
      canvas.width = srcSide;
      canvas.height = srcSide;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, srcSide, srcSide);
      const data = ctx.getImageData(0, 0, srcSide, srcSide).data;

      const total = srcSide * srcSide;
      const n = Math.min(target, total);
      // Even subsample stride across the source pixels.
      const stride = total / n;
      const aspect = img.width / img.height || 1;

      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const scatter = new Float32Array(n * 3);

      for (let i = 0; i < n; i++) {
        const si = Math.min(total - 1, Math.floor(i * stride));
        const sx = si % srcSide;
        const sy = Math.floor(si / srcSide);
        positions[i * 3] = (sx / srcSide - 0.5) * aspect;
        positions[i * 3 + 1] = -(sy / srcSide - 0.5);
        positions[i * 3 + 2] = 0;

        const di = si * 4;
        // Skip fully transparent pixels by collapsing them onto the plane center
        // with near-zero spread (cheap; avoids hard branch in the hot loop later).
        colors[i * 3] = (data[di] ?? 0) / 255;
        colors[i * 3 + 1] = (data[di + 1] ?? 0) / 255;
        colors[i * 3 + 2] = (data[di + 2] ?? 0) / 255;

        // Per-particle scatter target — radial outward + random depth.
        const ang = rand(i + 1) * Math.PI * 2;
        const radius = 0.6 + rand(i + 7) * 2.4;
        scatter[i * 3] = Math.cos(ang) * radius;
        scatter[i * 3 + 1] = Math.sin(ang) * radius;
        scatter[i * 3 + 2] = (rand(i + 13) - 0.5) * 3;
      }

      setSampled({ positions, colors, scatter, count: n });
    };
    return () => {
      cancelled = true;
    };
  }, [src, count]);

  // Geometry/material are stable; we only rewrite the instance matrices each frame.
  const geom = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  // Seed instance colors once the sample lands.
  useEffect(() => {
    const m = mesh.current;
    if (!m || !sampled) return;
    for (let i = 0; i < sampled.count; i++) {
      _color.setRGB(
        sampled.colors[i * 3] ?? 0,
        sampled.colors[i * 3 + 1] ?? 0,
        sampled.colors[i * 3 + 2] ?? 0,
      );
      m.setColorAt(i, _color);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [sampled]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m || !sampled) return;
    const prog = progress ? progress() : getScroll().progress;
    // Smooth bell: 0 at both ends (composed), 1 mid-scroll (dispersed).
    const t = Math.sin(Math.PI * Math.min(1, Math.max(0, prog)));
    // Ease the dispersion so recomposition feels magnetic, not linear.
    const disperse = t * t * (3 - 2 * t);
    const time = clock.elapsedTime;
    const { positions, scatter, count: n } = sampled;

    for (let i = 0; i < n; i++) {
      const bx = positions[i * 3] ?? 0;
      const by = positions[i * 3 + 1] ?? 0;
      const bz = positions[i * 3 + 2] ?? 0;
      const sx = scatter[i * 3] ?? 0;
      const sy = scatter[i * 3 + 1] ?? 0;
      const sz = scatter[i * 3 + 2] ?? 0;

      // Curl-ish turbulence so the cloud swirls instead of exploding straight out.
      const swirl = turbulence * disperse;
      const tx = Math.sin(time * 0.7 + i) * 0.15 * swirl;
      const ty = Math.cos(time * 0.6 + i * 1.3) * 0.15 * swirl;

      _pos.set(
        bx + sx * disperse + tx,
        by + sy * disperse + ty,
        bz + sz * disperse,
      );
      _mat.compose(_pos, _quat, _scl);
      m.setMatrixAt(i, _mat);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geom.dispose();
      material.dispose();
    };
  }, [geom, material]);

  if (!sampled) return null;

  return (
    <instancedMesh
      ref={mesh}
      args={[geom, material, sampled.count]}
      // Per-instance billboards sized by pointSize.
      scale={pointSize}
    />
  );
}
