"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScroll } from "./scroll-store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Lenis smooth scroll wired to GSAP ScrollTrigger, feeding the Zustand scroll
 * store with normalized progress + velocity on every frame.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const set = useScroll((s) => s.set);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ({ scroll, limit, velocity }) => {
      const progress = limit > 0 ? scroll / limit : 0;
      set(progress, velocity);
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, [set]);

  return <>{children}</>;
}
