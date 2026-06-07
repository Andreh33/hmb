"use client";

import { create } from "zustand";

/**
 * NOVA forge store — bridges the DOM "build your burger" picker to the WebGL
 * scene WITHOUT React re-renders in the RAF loop. The canvas reads getForge()
 * each frame; the DOM subscribes normally for its own UI.
 *
 * `src` is the image whose particles the forge re-composes into. `pulse` is a
 * monotonic counter bumped on every pick so the scene can fire a burst.
 */
export interface ForgeState {
  /** Image currently composed by the forge particle cloud (null = drifting). */
  src: string | null;
  /** Bumped on every pick — the scene watches this to trigger a burst. */
  pulse: number;
  /** Last picked item id, for DOM highlight. */
  pickedId: string | null;
  pick: (id: string, src: string) => void;
  clear: () => void;
}

export const useForge = create<ForgeState>((set) => ({
  src: null,
  pulse: 0,
  pickedId: null,
  pick: (id, src) =>
    set((s) => ({ src, pickedId: id, pulse: s.pulse + 1 })),
  clear: () => set({ src: null, pickedId: null }),
}));

/** Imperative accessor for the RAF/useFrame loop (no re-render). */
export const getForge = () => useForge.getState();
