"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FxCanvas } from "@/shared/fx";

/* -------------------------------------------------------------------------- */
/*  PRIME — Liquid Lens Cursor.                                               */
/*  A fixed full-viewport overlay (pointer-events: none) that renders a soft  */
/*  refractive lens following the pointer with magnetic lerp. It refracts a   */
/*  faint chromatic ring of the brand gold over whatever sits beneath it —    */
/*  pure additive glass, never blocks the page. Fine-pointer devices only.    */
/* -------------------------------------------------------------------------- */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform vec2  uMouse;     // ndc-ish, in plane space (-aspect..aspect, -1..1)
  uniform float uAspect;
  uniform float uTime;
  uniform float uPress;     // 0..1, swells the lens on click
  uniform float uActive;    // 0..1 fade in/out with pointer presence
  uniform float uHover;     // 0..1, lerps when over an interactive target
  uniform vec3  uColor;
  varying vec2 vUv;

  void main(){
    // Plane space coords centered, aspect-corrected.
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
    vec2 d = p - uMouse;
    float r = length(d);
    float ang = atan(d.y, d.x);

    // Idle breath + hover swell + press swell. Lens grows as a soft "focus"
    // ring over interactive targets, contracts to a tight bead at rest.
    float breath = 1.0 + 0.02 * sin(uTime * 1.1);
    float radius = (0.052 + uHover * 0.085 + uPress * 0.05) * breath;

    // Refractive rim: two offset chromatic bands give the glass a gilt fringe.
    float rimWidth = mix(0.020, 0.010, uHover);
    float rOuter = radius;
    float rInner = radius - rimWidth;
    float rim = smoothstep(rOuter, rOuter - rimWidth, r) - smoothstep(rInner, rInner - rimWidth, r);

    // Chromatic split of the rim along the radial direction.
    float caR = smoothstep(rOuter + 0.004, rInner, r);
    float caB = smoothstep(rOuter, rInner - 0.004, r);
    float chroma = clamp(caR - caB, 0.0, 1.0);

    // Soft glass body fill — a faint lensing glow inside the disc.
    float body = smoothstep(radius, radius * 0.2, r);

    // Shimmer riding the rim, breathing with time and angle.
    float shimmer = 0.55 + 0.45 * sin(uTime * 1.8 + ang * 3.0);

    vec3 gold = uColor;
    vec3 cool = mix(uColor, vec3(0.55, 0.7, 1.0), 0.5);
    vec3 col = gold * (rim * (0.55 + shimmer * 0.45))
             + cool * chroma * 0.5
             + gold * body * (0.06 + uHover * 0.05);

    float alpha = (rim * 0.85 + chroma * 0.35 + body * (0.07 + uHover * 0.06)) * uActive;
    gl_FragColor = vec4(col, alpha);
  }
`;

function LensQuad({ color }: { color: string }) {
  const { size, viewport } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);

  // Pointer state, magnetically lerped in RAF.
  const target = useRef(new THREE.Vector2(0, 0));
  const current = useRef(new THREE.Vector2(0, 0));
  const press = useRef(0);
  const active = useRef(0);
  const hover = useRef(0);
  // When over an interactive target, the lens is gently pulled to its center.
  const magnet = useRef<{ on: boolean; x: number; y: number }>({
    on: false,
    x: 0,
    y: 0,
  });

  const aspect = size.width / Math.max(1, size.height);

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: aspect },
      uTime: { value: 0 },
      uPress: { value: 0 },
      uActive: { value: 0 },
      uHover: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    // stable; updated imperatively
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const toPlane = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -((clientY / window.innerHeight) * 2 - 1);
      return new THREE.Vector2(nx * aspect, ny);
    };

    const onMove = (e: PointerEvent) => {
      const tEl = (e.target as Element | null)?.closest?.(
        '[data-cursor="hover"],a,button',
      ) as HTMLElement | null;
      if (tEl) {
        const r = tEl.getBoundingClientRect();
        const c = toPlane(r.left + r.width / 2, r.top + r.height / 2);
        magnet.current = { on: true, x: c.x, y: c.y };
        hover.current = 1;
      } else {
        magnet.current.on = false;
        hover.current = 0;
      }
      // Blend pointer toward the target center when magnetized (soft pull).
      const pt = toPlane(e.clientX, e.clientY);
      if (magnet.current.on) {
        pt.x += (magnet.current.x - pt.x) * 0.32;
        pt.y += (magnet.current.y - pt.y) * 0.32;
      }
      target.current.copy(pt);
      active.current = 1;
    };
    const onLeave = () => {
      active.current = 0;
      hover.current = 0;
      magnet.current.on = false;
    };
    const onDown = () => {
      press.current = 1;
    };
    const onUp = () => {
      press.current = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [aspect]);

  useFrame(({ clock }, delta) => {
    const m = mat.current;
    if (!m) return;
    const d = Math.min(delta, 1 / 30);
    // Magnetic lerp — elegant drift, not 1:1 tracking. Tighter when hovering a
    // target so the lens "locks on", looser at rest so it floats.
    const speed = 0.0009 - hover.current * 0.0006;
    const f = 1 - Math.pow(Math.max(0.00001, speed), d);
    current.current.lerp(target.current, Math.min(1, f));
    (m.uniforms.uMouse!.value as THREE.Vector2).copy(current.current);
    m.uniforms.uAspect!.value = aspect;
    m.uniforms.uTime!.value = clock.elapsedTime;
    // Smooth press, presence and hover.
    m.uniforms.uPress!.value +=
      (press.current - (m.uniforms.uPress!.value as number)) * Math.min(1, d * 12);
    m.uniforms.uActive!.value +=
      (active.current - (m.uniforms.uActive!.value as number)) * Math.min(1, d * 6);
    m.uniforms.uHover!.value +=
      (hover.current - (m.uniforms.uHover!.value as number)) * Math.min(1, d * 9);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Mount once at the page root. Self-gated to fine-pointer devices; the caller
 * additionally gates by tier (lite ⇒ don't mount). Fixed, non-interactive,
 * blended over everything.
 */
export function LiquidLensCursor({ color = "#C98A3E" }: { color?: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    >
      <FxCanvas
        dprRange={[1, 2]}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        gl={{ alpha: true, antialias: true }}
      >
        <LensQuad color={color} />
      </FxCanvas>
    </div>
  );
}
