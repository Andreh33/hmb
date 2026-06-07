// SEAR — Device capability detection (§16).
// Pure, framework-agnostic feature probing. Runs once on the client; the result
// is fed to the tier strategy in useTier.ts. No React, no side effects beyond
// a throwaway WebGL context used to read a couple of GPU caps.

export interface Capabilities {
  /** WebGPU adapter is exposed by the browser ('gpu' in navigator). */
  webgpu: boolean;
  /** A WebGL2 context could be created. */
  webgl2: boolean;
  /** Any WebGL context (1 or 2) is available — the floor for three/R3F. */
  webgl: boolean;
  /** navigator.deviceMemory in GB (coarse, browser-quantized). 0 if unknown. */
  deviceMemory: number;
  /** Logical CPU cores. Falls back to 4 if the browser hides it. */
  hardwareConcurrency: number;
  /** UA / pointer / touch heuristic for phones + small tablets. */
  mobile: boolean;
  /** Safari (incl. iOS WebKit) — historically weaker WebGL throughput. */
  safari: boolean;
  /** devicePixelRatio at detection time (used to cap render resolution). */
  dpr: number;
  /** True when running on the server / before hydration. */
  ssr: boolean;
}

/**
 * Conservative defaults used during SSR and as a safe fallback if probing
 * throws. These intentionally describe a capable-but-cautious device so the
 * first paint never assumes hardware it does not have.
 */
export const SSR_CAPABILITIES: Capabilities = {
  webgpu: false,
  webgl2: false,
  webgl: false,
  deviceMemory: 0,
  hardwareConcurrency: 4,
  mobile: false,
  safari: false,
  dpr: 1,
  ssr: true,
};

function detectWebGL(): { webgl: boolean; webgl2: boolean } {
  if (typeof document === "undefined") return { webgl: false, webgl2: false };
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      loseContext(gl2);
      return { webgl: true, webgl2: true };
    }
    const gl1 =
      canvas.getContext("webgl") ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl1) {
      loseContext(gl1);
      return { webgl: true, webgl2: false };
    }
  } catch {
    // Context creation can throw in locked-down / headless environments.
  }
  return { webgl: false, webgl2: false };
}

function loseContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  const ext = gl.getExtension("WEBGL_lose_context");
  ext?.loseContext();
}

function detectMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as desktop Safari; catch it via touch + Mac platform.
  const iPadOS =
    /Macintosh/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua) || iPadOS;
}

function detectSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Safari but not Chrome/Chromium/Edge/Firefox (all of which spoof "Safari").
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|FxiOS|Firefox/i.test(ua);
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
  gpu?: unknown;
}

/**
 * Probe the current device. Safe to call on the server (returns SSR defaults).
 * Cheap enough to run synchronously, but cache the result (see useTier).
 */
export function detectCapabilities(): Capabilities {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return SSR_CAPABILITIES;
  }

  const nav = navigator as NavigatorWithMemory;
  const { webgl, webgl2 } = detectWebGL();

  return {
    webgpu: "gpu" in navigator && nav.gpu != null,
    webgl2,
    webgl,
    deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : 0,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency > 0
        ? navigator.hardwareConcurrency
        : 4,
    mobile: detectMobile(),
    safari: detectSafari(),
    dpr:
      typeof window.devicePixelRatio === "number" && window.devicePixelRatio > 0
        ? window.devicePixelRatio
        : 1,
    ssr: false,
  };
}
