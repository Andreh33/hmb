"use client";

import { useEffect, useRef } from "react";
import { framePath, type HeroManifest } from "@/shared/hero/manifest";
import { getActProgress, type EmberAct } from "./scroll";
import { clamp01, emberEase, lerp } from "./motion";

/**
 * EMBER hero frame-scrub. Two render paths, both pure-canvas (Safari-native):
 *
 *  1. If the manifest ships a real photoreal frame sequence, it scrubs frames
 *     (montage act progress → floor(p·(n-1))) exactly like the shared
 *     FrameScrub, but driven by the *act* signal so the burger assembles across
 *     the pinned montage rather than the whole page.
 *
 *  2. Until real frames are dropped, it composites the manifest's layered burger
 *     SVGs into an assembling + rotating stack — the layers fly in from below
 *     and settle into a single burger as progress climbs. This keeps the hero an
 *     IMAGE (no CGI food), warm-graded, with a soft bloom + vignette baked into
 *     the canvas so it composites cinematically over the dark page.
 */
export function HeroFrameScrub({
  manifest,
  act = "montage",
  className,
}: {
  manifest: HeroManifest;
  act?: EmberAct;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const layersRef = useRef<{ img: HTMLImageElement; depth: number }[]>([]);
  const lastKey = useRef("");
  const lastGrade = useRef("");

  // Preload material once.
  useEffect(() => {
    const f = manifest.frames;
    if (f) {
      const imgs: HTMLImageElement[] = [];
      for (let i = 0; i < f.count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(f, i);
        imgs.push(img);
      }
      framesRef.current = imgs;
      return;
    }
    const layers = (manifest.layers ?? [])
      .slice()
      .sort((a, b) => a.depth - b.depth)
      .map((l) => {
        const img = new Image();
        img.decoding = "async";
        img.src = l.src;
        return { img, depth: l.depth };
      });
    layersRef.current = layers;
  }, [manifest]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (w === 0 || h === 0) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        // Resizing clears the canvas — invalidate the dedupe so the frame path
        // repaints into the new buffer instead of early-returning to a blank.
        lastKey.current = "";
        lastGrade.current = "";
      }

      const p = clamp01(getActProgress(act));
      const cx = w / 2;
      const cy = h * 0.52;
      const eased = emberEase(p);

      // Frame-sequence path -------------------------------------------------
      // Real photoreal frames. Sub-frame crossfade between adjacent frames so
      // the scrub reads as smooth motion-blurred film rather than a flipbook,
      // then the SAME baked grade as the layered path is applied every frame so
      // the bloom/vignette breathe with progress (never a flat dead frame).
      const frames = framesRef.current;
      if (frames.length > 0) {
        const fp = p * (frames.length - 1);
        const i0 = Math.floor(fp);
        const i1 = Math.min(frames.length - 1, i0 + 1);
        const blend = fp - i0;
        const key = `f${i0}-${blend.toFixed(2)}`;
        const grade = `g${eased.toFixed(3)}`;
        if (key === lastKey.current && grade === lastGrade.current) return;
        lastKey.current = key;
        lastGrade.current = grade;
        ctx.clearRect(0, 0, w, h);
        const a = frames[i0] ?? frames[0];
        const b = frames[i1] ?? a;
        if (a && a.complete && a.naturalWidth > 0) coverDraw(ctx, a, w, h, 1);
        if (b && b !== a && b.complete && b.naturalWidth > 0 && blend > 0.001) {
          coverDraw(ctx, b, w, h, blend);
        }
        applyGrade(ctx, w, h, cx, cy, eased);
        return;
      }

      // Layered-assembly path ----------------------------------------------
      const layers = layersRef.current;
      ctx.clearRect(0, 0, w, h);
      if (layers.length === 0) return;

      // Whole stack slowly rotates + rises as the burger "builds".
      const baseScale = Math.min(w, h) / 900;

      const n = layers.length;
      for (let i = 0; i < n; i++) {
        const layer = layers[i];
        if (!layer) continue;
        const { img } = layer;
        if (!img.complete || img.naturalWidth === 0) continue;

        // Each layer assembles in sequence across the scrub window.
        const segStart = (i / n) * 0.7;
        const local = clamp01((p - segStart) / 0.45);
        const settle = emberEase(local);

        // Fly-in offset from far below + slight lateral sway, settling to stack.
        const stackGap = h * 0.085 * baseScale * 3.2;
        const restY = cy + (i - (n - 1) / 2) * stackGap;
        const flyY = restY + (1 - settle) * h * 0.55;
        const sway = (1 - settle) * Math.sin(i * 2.3) * w * 0.06;
        const rot = (1 - settle) * 0.5 + eased * 0.06 * Math.sin(i);

        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = (Math.min(w, h) * 0.62) / Math.max(iw, ih);
        const dw = iw * scale;
        const dh = ih * scale;

        ctx.save();
        ctx.globalAlpha = lerp(0, 1, clamp01(local * 1.4));
        ctx.translate(cx + sway, flyY);
        ctx.rotate(rot);
        // Warm rim glow under each settling layer.
        ctx.shadowColor = "rgba(224,153,47,0.5)";
        ctx.shadowBlur = (12 + settle * 26) * dpr;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      applyGrade(ctx, w, h, cx, cy, eased);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [act]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

/**
 * Baked cinematic grade shared by both render paths: a warm centre bloom that
 * intensifies (and gains a faint heat-pulse) as the burger resolves, plus a
 * soft vignette so the stage sits in the dark frame. Composited in canvas so it
 * tracks the imagery exactly rather than as a flat CSS overlay.
 */
function applyGrade(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  eased: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
  // Heat pulse: subtle breathing on top of the progress-driven intensity.
  const pulse = 0.02 * Math.sin(performance.now() / 900);
  bloom.addColorStop(0, `rgba(224,153,47,${(0.1 + eased * 0.16 + pulse).toFixed(3)})`);
  bloom.addColorStop(0.5, `rgba(224,120,47,${(0.04 + eased * 0.06).toFixed(3)})`);
  bloom.addColorStop(1, "rgba(224,153,47,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Faint warm rim light sweeping the lower edge (grill heat from below).
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const floor = ctx.createLinearGradient(0, h, 0, h * 0.55);
  floor.addColorStop(0, `rgba(140,28,19,${(0.12 + eased * 0.1).toFixed(3)})`);
  floor.addColorStop(1, "rgba(140,28,19,0)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const vig = ctx.createRadialGradient(
    cx,
    cy,
    Math.min(w, h) * 0.25,
    cx,
    cy,
    Math.max(w, h) * 0.75,
  );
  vig.addColorStop(0, "rgba(11,10,9,0)");
  vig.addColorStop(1, "rgba(11,10,9,0.85)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  alpha: number,
) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let dw = w;
  let dh = h;
  if (ir > cr) dw = h * ir;
  else dh = w / ir;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
}
