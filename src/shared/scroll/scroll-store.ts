import { create } from "zustand";

export interface ScrollState {
  /** 0..1 over the whole page. */
  progress: number;
  /** Signed scroll velocity (px/frame-ish), smoothed by the driver. */
  velocity: number;
  /** Current act index for the active experience's storyboard. */
  act: number;
  set: (progress: number, velocity?: number) => void;
  setAct: (act: number) => void;
}

export const useScroll = create<ScrollState>((set) => ({
  progress: 0,
  velocity: 0,
  act: 0,
  set: (progress, velocity = 0) => set({ progress, velocity }),
  setAct: (act) => set({ act }),
}));

/**
 * Imperative accessor for RAF loops (canvas, shaders) that must NOT trigger
 * React re-renders. Read this inside useFrame / requestAnimationFrame.
 */
export const getScroll = () => useScroll.getState();
