"use client";

import { useEffect, useRef } from "react";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * Universal "glaze pouring over" overlay. A drip mask (noise + vertical
 * gradient) descends with scroll progress, color = --color-glaze, screen blend.
 * Appetizing, not sticky droplets. PRIME swaps this for the fluid sim; NOVA for
 * a particle jet. Canvas-based → works on every device.
 */
export function GlazeOverlay({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = (canvas.width = canvas.clientWidth * dpr);
      const h = (canvas.height = canvas.clientHeight * dpr);
      const prog = getScroll().progress;
      ctx.clearRect(0, 0, w, h);
      // Glaze descends as progress grows.
      const front = prog * h * 1.4;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `${color}00`);
      grad.addColorStop(Math.min(0.95, prog * 0.6 + 0.05), `${color}55`);
      grad.addColorStop(1, `${color}00`);
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, front);
      // Thin drip threads.
      ctx.fillStyle = `${color}88`;
      for (let i = 0; i < 9; i++) {
        const x = ((Math.sin(i * 91.17) * 43758.5453) % 1) * w;
        const len = front * (0.4 + ((Math.sin(i * 12.3) * 1000) % 1) * 0.5);
        ctx.fillRect(x, 0, 2 * dpr, len);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
