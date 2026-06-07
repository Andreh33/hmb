"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
}

/**
 * EMBER spark cursor — a fine gold point that trails drifting embers. Pure
 * canvas + RAF, fixed full-screen overlay, pointer-events: none. Skips coarse
 * (touch) pointers entirely. Sparks rise + fade like cinders off a grill.
 */
export function SparkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    // Disabled on coarse pointers AND when the user asks for reduced motion.
    if (prefersReducedMotion()) return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFine(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sparks: Spark[] = [];
    const pointer = { x: -100, y: -100, px: -100, py: -100, active: false };
    // Hover intensity (0..1) eased toward the target so the core swells/recedes
    // smoothly when entering/leaving interactive elements.
    const hover = { value: 0, target: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const onMove = (e: PointerEvent) => {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = e.clientX * dpr;
      pointer.y = e.clientY * dpr;
      pointer.active = true;
      // Emit a few embers proportional to pointer speed.
      const dx = pointer.x - pointer.px;
      const dy = pointer.y - pointer.py;
      const speed = Math.min(20, Math.hypot(dx, dy) / dpr);
      // Emit more embers when hovering an interactive element (richer reaction).
      const emit = 1 + Math.floor(speed / 4) + Math.round(hover.value * 2);
      for (let i = 0; i < emit && sparks.length < 220; i++) {
        sparks.push({
          x: pointer.x + (Math.random() - 0.5) * 6 * dpr,
          y: pointer.y + (Math.random() - 0.5) * 6 * dpr,
          vx: (Math.random() - 0.5) * 0.5 * dpr,
          vy: (-0.3 - Math.random() * 0.9) * dpr,
          life: 0,
          max: 28 + Math.random() * 34,
          size: (0.6 + Math.random() * 1.4) * dpr,
        });
      }
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      hover.target = t && t.closest('[data-cursor="hover"]') ? 1 : 0;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Ease hover intensity toward its target (weighty swell).
      hover.value += (hover.target - hover.value) * 0.12;
      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        if (!s) continue;
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.012 * dpr; // gentle rise (buoyant cinder)
        s.vx *= 0.99;
        const t = s.life / s.max;
        if (t >= 1) {
          sparks.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.9;
        const r = s.size * (1 - t * 0.4);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4);
        g.addColorStop(0, `rgba(255,224,150,${alpha})`);
        g.addColorStop(0.4, `rgba(224,153,47,${alpha * 0.7})`);
        g.addColorStop(1, "rgba(140,28,19,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bright core point at the pointer — gently breathing, swelling into a
      // soft halo ring when hovering an interactive target.
      if (pointer.active) {
        const breathe = 1 + 0.12 * Math.sin(performance.now() / 360);
        const coreR = (6 + hover.value * 5) * breathe * dpr;
        const g = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          coreR,
        );
        g.addColorStop(0, `rgba(255,240,200,${(0.9 + hover.value * 0.1).toFixed(3)})`);
        g.addColorStop(1, "rgba(224,153,47,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, coreR, 0, Math.PI * 2);
        ctx.fill();

        // Thin gold focus ring on hover.
        if (hover.value > 0.02) {
          ctx.strokeStyle = `rgba(224,153,47,${(hover.value * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, (14 + hover.value * 8) * dpr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <canvas
      aria-hidden
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9998,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
