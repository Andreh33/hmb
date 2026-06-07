"use client";

import { useScroll } from "./scroll-store";
import type { ScrollAct } from "./ScrollFilm";

export interface ActState {
  /** Active act index (0-based) from the scroll store. */
  index: number;
  /** The active act descriptor, if a storyboard is supplied. */
  act: ScrollAct | undefined;
  /** Stable id of the active act ("act-{i}" fallback when none supplied). */
  id: string;
  /** True when this is the first act. */
  isFirst: boolean;
  /** True when this is the last act of the supplied storyboard. */
  isLast: boolean;
}

/**
 * Reactive hook for the currently active scroll act. Subscribes to the scroll
 * store so consumers re-render on act change (NOT on every scroll frame — use
 * getScroll() for per-frame reads). Pass the experience's `acts` to resolve the
 * active descriptor and edges.
 */
export function useAct(acts?: ScrollAct[]): ActState {
  const index = useScroll((s) => s.act);
  const act = acts?.[index];
  const count = acts?.length ?? 0;

  return {
    index,
    act,
    id: act?.id ?? `act-${index}`,
    isFirst: index <= 0,
    isLast: count > 0 ? index >= count - 1 : false,
  };
}

/**
 * Returns just the active act index. Lighter subscription for components that
 * only care about the number (e.g. a progress dot strip).
 */
export function useActIndex(): number {
  return useScroll((s) => s.act);
}
