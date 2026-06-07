"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

export interface FxCanvasProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  /** Rendered while Three children/textures suspend. Defaults to null (transparent). */
  fallback?: ReactNode;
  /** Adaptive dpr clamp [min, max]. Defaults to a battery-friendly [1, 2]. */
  dprRange?: [number, number];
}

/**
 * <FxCanvas> — the single R3F entrypoint for the fx library.
 *
 * Bakes in the defaults every experience wants: Suspense boundary, adaptive
 * dpr (so retina laptops don't melt), antialiased + alpha gl, and a transparent
 * clear so the canvas composites over the page. Pointer events are off by
 * default (these are decorative layers); pass `eventSource`/`style` to override.
 *
 * SSR-safe by construction: this is a "use client" module and R3F's <Canvas>
 * only mounts in the browser. Heavy scenes should still be lazy-loaded by the
 * caller via next/dynamic({ ssr: false }) — see index.ts notes.
 */
export function FxCanvas({
  children,
  fallback = null,
  dprRange = [1, 2],
  gl,
  camera,
  style,
  ...rest
}: FxCanvasProps) {
  return (
    <Canvas
      dpr={dprRange}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", ...gl }}
      camera={camera ?? { fov: 35, position: [0, 0, 5] }}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
      {...rest}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </Canvas>
  );
}
