"use client";

import dynamic from "next/dynamic";

/**
 * Ambient 3D ember field for the hero, composited over the canvas frame-scrub.
 * Wraps the shared ParticleField + PostFX inside an FxCanvas. Lazy-loaded with
 * ssr:false by the lightweight wrapper below so Three never touches the server
 * and the heavy bundle only ships when the hero mounts.
 */
const Scene = dynamic(() => import("./EmberSparksScene").then((m) => m.EmberSparksScene), {
  ssr: false,
});

export function EmberSparks() {
  return <Scene />;
}
