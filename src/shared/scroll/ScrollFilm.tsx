"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScroll } from "./scroll-store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollAct {
  id: string;
  pin?: boolean;
  horizontal?: boolean;
  /** Build the scrubbed timeline for this act. */
  build: (tl: gsap.core.Timeline) => void;
}

/**
 * Orchestrates a film of scroll acts. Each act gets a pinned, scrubbed GSAP
 * timeline. The page TRANSFORMS as you scroll — not fade-in.
 */
export function ScrollFilm({
  acts,
  children,
  onProgress,
}: {
  acts: ScrollAct[];
  children: ReactNode;
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
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: act.pin ? "+=120%" : "bottom top",
            scrub: true,
            pin: act.pin ?? false,
            anticipatePin: 1,
            onEnter: () => setAct(i),
            onEnterBack: () => setAct(i),
            onUpdate: (self) => onProgress?.(self.progress),
          },
        });
        act.build(tl);
      });
    }, root);

    return () => ctx.revert();
  }, [acts, onProgress, setAct]);

  return (
    <div ref={rootRef}>
      {children}
    </div>
  );
}
