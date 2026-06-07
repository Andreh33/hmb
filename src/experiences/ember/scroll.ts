// EMBER local scroll bus. ScrollFilm fires per-act normalized progress via
// onProgress callbacks; we publish those into a tiny imperative store so canvas
// / RAF consumers (FrameScrub, sparks, glaze) can read precise act-progress
// WITHOUT triggering React re-renders. Same pattern as the shared scroll-store,
// but scoped to EMBER's storyboard so the hero frame-scrub maps to the montage
// pin (0..1) rather than the whole page.

export type EmberAct =
  | "montage"
  | "ingredients"
  | "morph"
  | "story"
  | "location";

type Listener = (p: number) => void;

const progress: Record<EmberAct, number> = {
  montage: 0,
  ingredients: 0,
  morph: 0,
  story: 0,
  location: 0,
};

const listeners: Record<EmberAct, Set<Listener>> = {
  montage: new Set(),
  ingredients: new Set(),
  morph: new Set(),
  story: new Set(),
  location: new Set(),
};

export function setActProgress(act: EmberAct, p: number): void {
  progress[act] = p;
  const set = listeners[act];
  set.forEach((fn) => fn(p));
}

export function getActProgress(act: EmberAct): number {
  return progress[act];
}

/** Subscribe to an act's progress (RAF/effect consumers). Returns unsubscribe. */
export function onAct(act: EmberAct, fn: Listener): () => void {
  listeners[act].add(fn);
  return () => {
    listeners[act].delete(fn);
  };
}
