"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Duotone, FluidSim } from "@/shared/fx";
import { getScroll } from "@/shared/scroll/scroll-store";
import type { PrimeArt } from "../art";

/* -------------------------------------------------------------------------- */
/*  PRIME hero scene — runs INSIDE an <FxCanvas>.                             */
/*                                                                            */
/*  Layer 1: a duotone plate of the hero photo, fit to a cover crop and       */
/*    revealed by a liquid displacement mask on intro, then held still.       */
/*  Layer 2 (full tier only): a pointer-reactive GPU fluid "glaze" composited */
/*    additively over the plate — the molten gilt that reacts to the cursor.  */
/* -------------------------------------------------------------------------- */

const revealVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

// Liquid reveal mask laid over the duotone plate (the duotone shader has no
// alpha-reveal, so we punch the reveal with a second additive ink wash that
// retreats as the intro progresses).
const inkVert = revealVert;
const inkFrag = /* glsl */ `
  precision highp float;
  uniform float uReveal;   // 0 (covered) -> 1 (open)
  uniform float uTime;
  uniform vec3  uInk;
  uniform vec3  uGold;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  // fBm — layered noise gives the wash a torn, organic ink frontier.
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main(){
    // Slow drifting fBm so the reveal edge tears like ink soaking into paper.
    float n = fbm(vUv * vec2(2.4, 3.4) + vec2(uTime * 0.015, uTime * 0.03));
    float field = vUv.y * 0.6 + n * 0.42;
    float edge = 0.14;
    float cover = 1.0 - smoothstep(field - edge, field + edge, uReveal);

    // Gilt frontier: a thin glowing seam riding the retreating ink edge.
    float seam = smoothstep(field - edge, field, uReveal) - smoothstep(field, field + edge * 0.5, uReveal);
    seam *= step(0.001, cover) * (1.0 - cover);
    vec3 col = mix(uInk, uGold, seam * 1.4);

    // Fine grain dissolved into the ink so the wash never reads as flat fill.
    float g = hash(vUv * 900.0 + uTime) - 0.5;
    float alpha = clamp(cover + g * 0.05 * cover + seam * 0.5, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Film grain + a soft editorial vignette, multiplied over the plate. Keeps the
// duotone from looking digital — it reads like ink on coated stock.
const grainVert = revealVert;
const grainFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntro;  // grain blooms in with the reveal
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

  void main(){
    // Animated monochrome grain, only the bright half kept (additive specks).
    float g = hash(vUv * vec2(1280.0, 720.0) + fract(uTime) * 91.7);
    float speck = max(0.0, g - 0.55) * 1.4;

    // Concentrate grain mid-frame, falling off toward the edges so corners
    // read clean and the eye lands on the subject.
    vec2 c = vUv - 0.5;
    float fall = smoothstep(0.95, 0.25, length(c));

    float a = speck * 0.07 * fall * uIntro;
    gl_FragColor = vec4(vec3(1.0), a);
  }
`;

export function PrimeHeroScene({
  src,
  art,
  fluid,
  introRef,
}: {
  src: string;
  art: PrimeArt;
  /** Whether to mount the GPU fluid glaze (full tier). */
  fluid: boolean;
  /** Shared intro progress 0..1, advanced by the scene each frame on mount. */
  introRef: React.MutableRefObject<number>;
}) {
  const { viewport } = useThree();
  const inkMat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);

  const grainMat = useRef<THREE.ShaderMaterial>(null);

  const inkUniforms = useMemo(
    () => ({
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uInk: { value: new THREE.Color(art.shadow) },
      uGold: { value: new THREE.Color(art.highlight) },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const grainUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntro: { value: 0 },
    }),
    [],
  );

  // Drive the intro reveal (eased) and a gentle parallax-on-scroll for the
  // whole plate group. Hero is "still": after intro it barely breathes.
  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30); // clamp on tab refocus so intro never jumps
    introRef.current = Math.min(1, introRef.current + d / 1.7);
    // easeInOutQuint — the ink lingers then releases, never a linear wipe.
    const x = introRef.current;
    const eased =
      x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;

    const im = inkMat.current;
    if (im) {
      im.uniforms.uReveal!.value = eased;
      im.uniforms.uTime!.value += d;
      (im.uniforms.uInk!.value as THREE.Color).set(art.shadow);
      (im.uniforms.uGold!.value as THREE.Color).set(art.highlight);
    }

    const gm = grainMat.current;
    if (gm) {
      gm.uniforms.uTime!.value = state.clock.elapsedTime;
      gm.uniforms.uIntro!.value = eased;
    }

    const g = group.current;
    if (g) {
      const p = getScroll().progress;
      // Slow rise + micro-scale as the page scrolls — editorial, restrained.
      // A near-imperceptible breath keeps the still plate alive.
      const breath = Math.sin(state.clock.elapsedTime * 0.35) * 0.0035;
      g.position.y = p * 0.6;
      const s = 1 + p * 0.045 + breath;
      g.scale.set(s, s, 1);
    }
  });

  // Fit a cover crop into the viewport. The image is square-ish placeholder;
  // we size the plane to the viewport with a slight overscan.
  const planeW = viewport.width * 1.04;
  const planeH = viewport.height * 1.04;

  return (
    <group ref={group}>
      {/* Duotone plate */}
      <group scale={[planeW, planeH, 1]}>
        <Duotone
          src={src}
          shadow={art.shadow}
          highlight={art.highlight}
          intensity={1}
          contrast={art.contrast}
        />
      </group>

      {/* Liquid ink reveal wash (retreats on intro) */}
      <mesh position={[0, 0, 0.01]} scale={[planeW, planeH, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={inkMat}
          vertexShader={inkVert}
          fragmentShader={inkFrag}
          uniforms={inkUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* GPU fluid glaze, pointer-reactive (full tier only) */}
      {fluid ? (
        <group position={[0, 0, 0.02]}>
          <FluidSim color={art.glaze} resolution={256} dissipation={0.985} radius={0.0014} />
        </group>
      ) : null}

      {/* Film grain — additive specks that bloom in with the reveal. */}
      <mesh position={[0, 0, 0.03]} scale={[planeW, planeH, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={grainMat}
          vertexShader={grainVert}
          fragmentShader={grainFrag}
          uniforms={grainUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
