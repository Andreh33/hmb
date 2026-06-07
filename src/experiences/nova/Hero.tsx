"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getScroll } from "@/shared/scroll/scroll-store";
import { SplitText } from "@/shared/motion/primitives";
import { EASE } from "@/shared/motion/easings";
import { SoundToggle } from "@/shared/ui/SoundToggle";
import { v } from "./theme";
import { VOLUMETRIC_CONE } from "./art";

/** smootherstep — eased 0→1 with zero accel at both ends (weighty feel). */
function smoother(x: number): number {
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * NOVA hero — "Ignition". The photoreal burger is rendered as ~100k particles
 * by the persistent canvas behind this DOM. Here we own:
 *  - the signed type lockup (real, indexable text)
 *  - the volumetric light cone (CSS, composites over the canvas)
 *  - the ORBIT PAD: a full-bleed transparent layer that captures drag for the
 *    OrbitControls bound in NovaScene, so the user can grab and spin the cloud.
 *
 * The hero is pinned-feeling: as you scroll, the title lifts + dilates + fades
 * while the cone parallaxes the opposite way and the particles below it burst.
 * The lift is driven imperatively from getScroll() in a single RAF (no React
 * re-render per frame) and eased with smootherstep so it has real mass — the
 * exit is choreographed as carefully as the entrance.
 */
export function NovaHero({
  onOrbitPad,
}: {
  /** Hands the orbit-capture element up to the page so NovaScene can bind it. */
  onOrbitPad: (el: HTMLDivElement | null) => void;
}) {
  const t = useTranslations("hero");
  const padRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const coneRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const [hintHover, setHintHover] = useState(false);

  useEffect(() => {
    onOrbitPad(padRef.current);
    return () => onOrbitPad(null);
  }, [onOrbitPad]);

  // Imperative, eased hero exit — RAF reads the shared scroll store directly so
  // the lockup tracks scroll at display refresh rate without re-rendering React.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      // Local hero progress over the first ~18% of the page.
      const p = Math.min(1, getScroll().progress / 0.18);
      const e = smoother(p);
      const lock = lockupRef.current;
      if (lock) {
        // Lift, dilate and fade — the words ascend into the burst as light.
        lock.style.transform = `translate3d(0, ${(-e * 140).toFixed(2)}px, 0) scale(${(1 + e * 0.12).toFixed(4)})`;
        lock.style.opacity = String(Math.max(0, 1 - e * 1.15));
        lock.style.filter = `blur(${(e * 6).toFixed(2)}px)`;
      }
      // Cone parallaxes downward against the rising title (counter-motion depth).
      const cone = coneRef.current;
      if (cone) {
        cone.style.transform = `translate3d(0, ${(e * 60).toFixed(2)}px, 0) scale(${(1 + e * 0.08).toFixed(4)})`;
        cone.style.opacity = String(Math.max(0, 1 - e * 0.9));
      }
      // Dock slides out below as you leave the hero.
      const dock = dockRef.current;
      if (dock) {
        dock.style.transform = `translate3d(0, ${(e * 40).toFixed(2)}px, 0)`;
        dock.style.opacity = String(Math.max(0, 1 - e * 1.6));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="inicio"
      data-act="ignition"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {/* Volumetric cone over the particle cloud. */}
      <div ref={coneRef} style={VOLUMETRIC_CONE} aria-hidden />

      {/* Orbit-capture pad — transparent, sits over the canvas in the hero only.
          pointerEvents auto so drag reaches OrbitControls; the title block above
          re-enables its own interactivity where needed. */}
      <div
        ref={padRef}
        aria-hidden
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
        style={{ zIndex: 3, pointerEvents: "auto" }}
      />

      {/* Signed type lockup — floats above the orbit pad, ignores pointer so the
          cloud stays grabbable behind the words. */}
      <div
        ref={lockupRef}
        className="relative px-5 text-center"
        style={{
          zIndex: 4,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
        }}
      >
        <p
          className="mb-5 text-xs uppercase"
          style={{
            color: v.accent2,
            letterSpacing: "0.5em",
            // Optical compensation: tracked-out caps need the trailing space trimmed.
            textIndent: "0.5em",
            textShadow: `0 0 24px ${v.accent2}66`,
          }}
        >
          {t("eyebrow")}
        </p>
        <h1
          className="font-display font-black"
          style={{
            fontSize: "clamp(3.5rem, 14vw, 13rem)",
            lineHeight: 0.82,
            letterSpacing: "-0.035em",
            color: v.text,
            // Layered glow: a tight solar core + a wide plasma halo for depth.
            textShadow: `0 0 40px ${v.glaze}, 0 0 120px ${v.accent}55, 0 0 200px ${v.accent2}33`,
            mixBlendMode: "screen",
          }}
        >
          <SplitText text="NOVA" />
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl text-lg md:text-2xl"
          style={{
            color: v.muted,
            textWrap: "balance",
            letterSpacing: "-0.01em",
          }}
        >
          {t("subtitle")}
        </p>
      </div>

      {/* Bottom dock: orbit hint + sound. pointerEvents on so they're usable. */}
      <div
        ref={dockRef}
        className="absolute inset-x-0 bottom-6 flex items-center justify-between px-5 md:px-8"
        style={{ zIndex: 5, willChange: "transform, opacity" }}
      >
        <button
          type="button"
          onClick={() => setHint(false)}
          onPointerEnter={() => setHintHover(true)}
          onPointerLeave={() => setHintHover(false)}
          className="group flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] backdrop-blur"
          style={{
            borderColor: hintHover ? `${v.accent}80` : `${v.muted}40`,
            background: hintHover ? `${v.surface}dd` : `${v.surface}aa`,
            color: v.text,
            opacity: hint ? 1 : 0.35,
            boxShadow: hintHover ? `0 0 32px ${v.accent}33` : "none",
            transform: hintHover ? "translateY(-2px)" : "translateY(0)",
            transition: `all 0.5s ${EASE.lux}`,
          }}
        >
          <span
            className="nova-anim inline-block h-2 w-2 rounded-full"
            style={{
              background: v.accent,
              boxShadow: `0 0 12px ${v.accent}`,
              animation: "nova-hint-glide 1.8s ease-in-out infinite",
            }}
            aria-hidden
          />
          {t("scrollHint")}
        </button>
        <SoundToggle />
      </div>
    </section>
  );
}
