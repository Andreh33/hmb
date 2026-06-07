"use client";

import { useEffect, useRef } from "react";
import { framePath, type HeroManifest } from "./manifest";
import { getScroll } from "@/shared/scroll/scroll-store";

/**
 * Scrubbed image-sequence hero. Preloads N frames (webp/avif) and paints the
 * frame at floor(progress·(count-1)) to a 2D canvas. The photorealistic burger
 * assembles/rotates as you scroll. Pure canvas → runs natively on Safari.
 */
export function FrameScrub({
  manifest,
  className,
}: {
  manifest: HeroManifest;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(0);
  const lastFrame = useRef(-1);

  useEffect(() => {
    const frames = manifest.frames;
    if (!frames) return;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < frames.count; i++) {
      const img = new Image();
      img.src = framePath(frames, i);
      img.onload = () => {
        loadedRef.current += 1;
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, [manifest]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const imgs = imagesRef.current;
      if (!canvas || imgs.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const count = imgs.length;
      const prog = getScroll().progress;
      const frame = Math.min(count - 1, Math.floor(prog * (count - 1)));
      if (frame === lastFrame.current) return;
      lastFrame.current = frame;
      const img = imgs[frame] ?? imgs[0];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // cover fit
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let dw = w;
      let dh = h;
      if (ir > cr) dw = h * ir;
      else dh = w / ir;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
