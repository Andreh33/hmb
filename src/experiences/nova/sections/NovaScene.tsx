"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FxCanvas } from "@/shared/fx/Canvas";
import { ImageParticles } from "@/shared/fx/ImageParticles";
import { ParticleField } from "@/shared/fx/ParticleField";
import { PostFXPreset } from "@/shared/fx/postfx";
import { getScroll } from "@/shared/scroll/scroll-store";
import type { TierFlags } from "@/shared/perf/useTier";
import { NOVA_COLORS } from "../theme";
import { HERO_STILL } from "../art";
import { cameraFor, damp } from "../motion";
import { getForge } from "../scroll";

/**
 * The persistent NOVA cloud. A single rig holds:
 *  - the HERO ImageParticles (the photo that coalesces / bursts on scroll)
 *  - the FORGE ImageParticles (swaps to the picked menu image, re-composing)
 *  - an ambient vapor ParticleField
 *  - two colored point-lights that pulse with the burst (volumetric feel)
 *
 * The whole rig rotates on a continuous orbit + scroll twist; OrbitControls let
 * the user grab and spin the cloud within limits. All scroll/forge reads happen
 * in useFrame via the imperative stores — zero React churn per frame. Group
 * cross-fades are opacity-driven (never hard visibility pops) so stations
 * dissolve into one another like a single continuous shot.
 */
function NovaCloud({
  tier,
  orbitTarget,
}: {
  tier: TierFlags;
  orbitTarget: HTMLElement | null;
}) {
  const rig = useRef<THREE.Group>(null);
  const heroGroup = useRef<THREE.Group>(null);
  const forgeGroup = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const fillLight = useRef<THREE.PointLight>(null);

  // Forge image state mirrored into React only to remount ImageParticles when
  // the picked src changes (the per-frame energy is read imperatively).
  const [forgeSrc, setForgeSrc] = useState<string | null>(null);
  const lastPulse = useRef(0);
  const forgeEnergy = useRef(0);
  // Smoothed visibility so cross-fades ease instead of snapping.
  const heroOpacity = useRef(1);
  const forgeOpacity = useRef(0);

  // Particle budgets scale with tier. WebGPU/full → dense; medio → sparse.
  const heroCount = tier.tier === "full" ? 90000 : 32000;
  const forgeCount = tier.tier === "full" ? 36000 : 14000;
  const vaporCount = Math.min(tier.maxParticles, tier.tier === "full" ? 1200 : 500);

  // Hero dispersion: composed (0) at top, bursts as the hero act scrolls past.
  const heroProgress = useMemo(
    () => () => {
      // Map only the first ~22% of the page (the hero station) to a full
      // disperse→recompose bell so the photo "explodes" as you leave it.
      const p = getScroll().progress;
      return Math.min(1, p / 0.22);
    },
    [],
  );

  // Forge dispersion: driven by a decaying energy pulse fired on each pick.
  const forgeProgress = useMemo(
    () => () => forgeEnergy.current,
    [],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    // Guard delta (tab refocus can spike it) so smoothing stays stable.
    const dt = Math.min(0.05, delta);
    const { progress, velocity } = getScroll();
    const cam = cameraFor(progress, t);

    // --- rig orbit + scroll-camera dolly ---
    // OrbitControls OWNS the camera transform (user orbit). The scroll-camera
    // therefore acts on the RIG: a depth push (position.z), a continuous base
    // spin layered UNDER the user's orbit, and a vertical parallax pan. This
    // avoids fighting OrbitControls over camera.position. All motion is damped
    // frame-rate-independently so 60Hz and 120Hz feel identical.
    const r = rig.current;
    if (r) {
      const targetZ = -(cam.z - 4.2); // 0 at hero, negative as it recedes
      r.position.z = damp(r.position.z, targetZ, 4, dt);
      // Velocity adds a momentary twist lead so fast flicks have inertia.
      const targetRotY = cam.rotY + velocity * 0.0008;
      r.rotation.y = damp(r.rotation.y, targetRotY, 6, dt);
      r.rotation.x = damp(r.rotation.x, cam.rotX, 5, dt);
      r.position.y = damp(r.position.y, cam.panY, 5, dt);
      r.position.x = damp(r.position.x, cam.panX, 5, dt);
    }

    // --- station cross-fade: hero owns the top, forge owns the mid-page ---
    const heroVis = 1 - smooth(progress, 0.16, 0.32);
    const forgeVis =
      smooth(progress, 0.34, 0.46) * (1 - smooth(progress, 0.64, 0.80));
    heroOpacity.current = damp(heroOpacity.current, heroVis, 6, dt);
    forgeOpacity.current = damp(forgeOpacity.current, forgeVis, 6, dt);

    if (heroGroup.current) {
      const o = heroOpacity.current;
      heroGroup.current.visible = o > 0.004;
      // Subtle scale lift on entry, slight recede on exit — entrances and exits
      // get the same care.
      heroGroup.current.scale.setScalar(0.88 + o * 0.26);
      applyOpacity(heroGroup.current, o);
    }
    if (forgeGroup.current) {
      const o = forgeOpacity.current;
      forgeGroup.current.visible = o > 0.004;
      forgeGroup.current.scale.setScalar(0.78 + o * 0.5);
      applyOpacity(forgeGroup.current, o);
    }

    // --- volumetric lights pulse with burst energy ---
    const energy = Math.max(cam.burst, forgeEnergy.current);
    if (keyLight.current) {
      keyLight.current.intensity = damp(
        keyLight.current.intensity,
        6 + energy * 16,
        8,
        dt,
      );
      keyLight.current.position.x = Math.sin(t * 0.4) * 2.4;
      keyLight.current.position.y = 1.5 + Math.sin(t * 0.3) * 0.4;
    }
    if (rimLight.current) {
      rimLight.current.intensity = damp(
        rimLight.current.intensity,
        4 + energy * 11,
        8,
        dt,
      );
      rimLight.current.position.x = Math.cos(t * 0.35) * -2.6;
    }
    if (fillLight.current) {
      // A slow breathing fill so the cloud is never flatly lit.
      fillLight.current.intensity = 1.4 + Math.sin(t * 0.5) * 0.5;
    }

    // --- forge pulse decay ---
    const fg = getForge();
    if (fg.pulse !== lastPulse.current) {
      lastPulse.current = fg.pulse;
      forgeEnergy.current = 1; // fire a burst
      if (fg.src !== forgeSrc) setForgeSrc(fg.src);
    }
    // Decay back toward composed (energy → 0) so the picked burger re-forms.
    // Frame-rate-independent so the recompose always lasts ~0.9s.
    forgeEnergy.current = damp(forgeEnergy.current, 0, 1.6, dt);
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={0.32} />
      <pointLight
        ref={keyLight}
        color={NOVA_COLORS.accent}
        intensity={8}
        distance={18}
        position={[2, 1.5, 3]}
      />
      <pointLight
        ref={rimLight}
        color={NOVA_COLORS.accent2}
        intensity={5}
        distance={18}
        position={[-2.5, -1, 2]}
      />
      <pointLight
        ref={fillLight}
        color={NOVA_COLORS.glaze}
        intensity={1.4}
        distance={14}
        position={[0, 0, 4]}
      />

      <group ref={heroGroup}>
        <ImageParticles
          src={HERO_STILL}
          count={heroCount}
          progress={heroProgress}
          pointSize={0.011}
          turbulence={0.7}
        />
      </group>

      {forgeSrc ? (
        <group ref={forgeGroup} position={[0, 0, 0.2]}>
          <ImageParticles
            src={forgeSrc}
            count={forgeCount}
            progress={forgeProgress}
            pointSize={0.013}
            turbulence={0.9}
          />
        </group>
      ) : null}

      {/* Ambient vapor / steam drifting through the whole field. */}
      <ParticleField
        count={vaporCount}
        color={NOVA_COLORS.glaze}
        size={0.02}
        spread={9}
        speed={0.1}
      />

      {/* Limited orbit, bound to the hero-only drag pad so the rest of the page
          (menu, cart) stays fully clickable. User grabs the cloud and spins it
          within a clamped cone — never loses it off-axis. */}
      {orbitTarget ? (
        <OrbitControls
          domElement={orbitTarget}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.65}
          minAzimuthAngle={-Math.PI * 0.35}
          maxAzimuthAngle={Math.PI * 0.35}
        />
      ) : null}
    </group>
  );
}

/** Local smoothstep (kept inline to stay in the hot frame loop). */
function smooth(x: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
}

/**
 * Fade every material under a group by writing opacity once per frame. The
 * particle meshes use transparent MeshBasicMaterial, so this dissolves the
 * whole station smoothly instead of hard-toggling visibility.
 */
function applyOpacity(group: THREE.Group, opacity: number): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        m.transparent = true;
        m.opacity = opacity;
      }
    } else {
      mat.transparent = true;
      mat.opacity = opacity;
    }
  });
}

/**
 * The full-bleed fixed canvas behind the whole NOVA page. Mounted only when the
 * tier allows a 3D canvas; otherwise the page renders the CSS aurora alone.
 */
export function NovaScene({
  tier,
  orbitTarget,
}: {
  tier: TierFlags;
  /** The hero-only drag pad OrbitControls binds to (keeps DOM clickable). */
  orbitTarget: HTMLElement | null;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        // Canvas itself never eats clicks — orbit is captured by the hero pad.
        pointerEvents: "none",
      }}
    >
      <FxCanvas
        dprRange={[1, tier.maxDpr]}
        camera={{ fov: 38, position: [0, 0, 4.2] }}
        gl={{ antialias: tier.tier === "full" }}
      >
        <NovaCloud tier={tier} orbitTarget={orbitTarget} />
        {tier.postfx ? <PostFXPreset feel="nova" /> : null}
      </FxCanvas>
    </div>
  );
}
