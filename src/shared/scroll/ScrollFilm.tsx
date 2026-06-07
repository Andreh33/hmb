"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { useScroll } from "./scroll-store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Observer);
}

export interface ScrollAct {
  id: string;
  pin?: boolean;
  horizontal?: boolean;
  /**
   * Pin distance for this act. Number = px, string = ScrollTrigger `end`
   * syntax (e.g. "+=150%"). Optional, additive — defaults preserve old behavior.
   */
  distance?: number | string;
  /** Per-act normalized progress (0..1), fired on every scroll frame. */
  onProgress?: (p: number) => void;
  /** Build the scrubbed timeline for this act. */
  build: (tl: gsap.core.Timeline) => void;
}

/**
 * Orchestrates a film of scroll acts. Each act gets a pinned, scrubbed GSAP
 * timeline. The page TRANSFORMS as you scroll — not fade-in.
 *
 * Horizontal acts (`horizontal: true`) pin the section and translate their
 * inner track on X via the act timeline, driven by an Observer-aware
 * ScrollTrigger so wheel + touch + trackpad all map to lateral motion.
 */
export function ScrollFilm({
  acts,
  children,
  onProgress,
}: {
  acts: ScrollAct[];
  children: ReactNode;
  /** Global normalized progress of the active act. */
  onProgress?: (p: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const setAct = useScroll((s) => s.setAct);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-act]");

      sections.forEach((section, i) => {
        const act = acts[i];
        if (!act) return;

        const pinned = act.pin ?? false;
        const horizontal = act.horizontal ?? false;

        // Resolve the pin distance: explicit > horizontal-measured > default.
        const track =
          horizontal
            ? (section.firstElementChild as HTMLElement | null)
            : null;

        const measureHorizontal = () =>
          track ? Math.max(0, track.scrollWidth - section.offsetWidth) : 0;

        const explicitDistance =
          typeof act.distance === "number"
            ? `+=${act.distance}`
            : act.distance;

        const end =
          explicitDistance ??
          (horizontal
            ? () => `+=${measureHorizontal()}`
            : pinned
              ? "+=120%"
              : "bottom top");

        const handleUpdate = (self: ScrollTrigger) => {
          act.onProgress?.(self.progress);
          onProgress?.(self.progress);
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end,
            scrub: horizontal ? 1 : true,
            pin: pinned || horizontal,
            anticipatePin: 1,
            invalidateOnRefresh: horizontal,
            onEnter: () => setAct(i),
            onEnterBack: () => setAct(i),
            onUpdate: handleUpdate,
          },
        });

        // For horizontal acts, lay down the lateral translation first so the
        // act.build() can layer staggered reveals on top of the moving track.
        if (horizontal && track) {
          tl.to(
            track,
            { x: () => -measureHorizontal(), ease: "none" },
            0,
          );
        }

        act.build(tl);
      });
    }, root);

    return () => ctx.revert();
  }, [acts, onProgress, setAct]);

  return <div ref={rootRef}>{children}</div>;
}
