"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Sim pass — advect a dye/velocity field, inject at the pointer, dissipate.  */
/*  This is a lightweight single-buffer Eulerian fluid: each frame we sample   */
/*  the previous state, advect it toward the pointer's motion, add a splat at  */
/*  the cursor, and decay. Ping-pong between two FBOs so reads never alias the */
/*  write target.                                                              */
/* -------------------------------------------------------------------------- */

const simVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const simFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPrev;
  uniform vec2  uMouse;     // 0..1
  uniform vec2  uVel;       // pointer velocity
  uniform float uAspect;
  uniform float uDissipation;
  uniform float uRadius;
  varying vec2 vUv;

  void main(){
    // Advect: pull from slightly behind the pointer motion for a flowing trail.
    vec2 advUv = vUv - uVel * 0.015;
    vec3 prev = texture2D(uPrev, advUv).rgb * uDissipation;

    // Splat at pointer, aspect-corrected so it stays circular.
    vec2 d = (vUv - uMouse) * vec2(uAspect, 1.0);
    float splat = exp(-dot(d, d) / uRadius);
    vec3 inject = vec3(abs(uVel) * 6.0 + 0.15, splat) * splat;

    gl_FragColor = vec4(max(prev, inject * vec3(1.0, 1.0, 0.0) + vec3(0.0, 0.0, splat * 0.8)), 1.0);
  }
`;

/* Display pass — colorize the dye field as a glaze/ripple overlay. */
const displayVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const displayFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uField;
  uniform vec3  uColor;
  uniform float uTime;
  varying vec2 vUv;

  void main(){
    vec3 f = texture2D(uField, vUv).rgb;
    float dye = f.b;                                  // accumulated dye
    // Refractive ripple driven by the field gradient.
    float ripple = sin(dye * 24.0 - uTime * 2.0) * dye;
    float glow = dye * 0.9 + ripple * 0.4;
    gl_FragColor = vec4(uColor * glow, glow);
  }
`;

export interface FluidSimProps {
  color?: string;
  /** Sim buffer resolution (square). Lower = cheaper. */
  resolution?: number;
  /** Trail persistence 0..1. Higher = longer-lived streaks. */
  dissipation?: number;
  /** Splat radius (smaller = tighter). */
  radius?: number;
}

/**
 * Pointer-reactive fluid overlay — real ping-pong FBO advection (dye + velocity
 * injected at the cursor, advected and dissipated each frame), composited as a
 * colored glaze/ripple. Replaces the static ripple with a flowing field.
 *
 * Mount inside an <FxCanvas>. The sim runs off-screen via createPortal so it
 * never touches the main scene graph.
 */
export function FluidSim({
  color = "#C98A3E",
  resolution = 256,
  dissipation = 0.97,
  radius = 0.0008,
}: FluidSimProps) {
  const { size, gl } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  // Off-screen ping-pong scene + camera.
  const simScene = useMemo(() => new THREE.Scene(), []);
  const simCam = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    [],
  );

  const fboA = useFBO(resolution, resolution, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });
  const fboB = useFBO(resolution, resolution, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });
  const read = useRef(fboA);
  const write = useRef(fboB);

  const simMat = useRef<THREE.ShaderMaterial>(null);
  const displayMat = useRef<THREE.ShaderMaterial>(null);

  const prevPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const vel = useRef(new THREE.Vector2(0, 0));

  const simUniforms = useMemo(
    () => ({
      uPrev: { value: fboA.texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVel: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: aspect },
      uDissipation: { value: dissipation },
      uRadius: { value: radius },
    }),
    // intentionally stable; values updated imperatively in useFrame
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const displayUniforms = useMemo(
    () => ({
      uField: { value: fboA.texture },
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame(({ pointer, clock }) => {
    const sm = simMat.current;
    const dm = displayMat.current;
    if (!sm || !dm) return;

    // Pointer in 0..1 + velocity.
    const mx = (pointer.x + 1) / 2;
    const my = (pointer.y + 1) / 2;
    vel.current.set(mx - prevPointer.current.x, my - prevPointer.current.y);
    prevPointer.current.set(mx, my);

    (sm.uniforms.uMouse!.value as THREE.Vector2).set(mx, my);
    (sm.uniforms.uVel!.value as THREE.Vector2).copy(vel.current);
    sm.uniforms.uAspect!.value = aspect;
    sm.uniforms.uDissipation!.value = dissipation;
    sm.uniforms.uRadius!.value = radius;
    sm.uniforms.uPrev!.value = read.current.texture;

    // Render the sim into the write target.
    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(write.current);
    gl.render(simScene, simCam);
    gl.setRenderTarget(prevTarget);

    // Swap.
    const tmp = read.current;
    read.current = write.current;
    write.current = tmp;

    // Display reads the freshest field.
    dm.uniforms.uField!.value = read.current.texture;
    (dm.uniforms.uColor!.value as THREE.Color).set(color);
    dm.uniforms.uTime!.value = clock.elapsedTime;
  });

  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={simMat}
            vertexShader={simVert}
            fragmentShader={simFrag}
            uniforms={simUniforms}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>,
        simScene,
      )}

      <mesh scale={[2, 2, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={displayMat}
          vertexShader={displayVert}
          fragmentShader={displayFrag}
          uniforms={displayUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/**
 * PRIME preset — slow, glossy, long-lived glaze tuned for the PRIME hero.
 * Re-exported convenience so PRIME doesn't re-derive tuning constants.
 */
export function FluidSimPrime({ color = "#C98A3E" }: { color?: string }) {
  return <FluidSim color={color} resolution={256} dissipation={0.985} radius={0.0012} />;
}
