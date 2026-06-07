"use client";

import Image from "next/image";
import { KineticMarquee } from "./KineticMarquee";

export interface StripImage {
  src: string;
  alt: string;
}

/**
 * A scroll-reactive horizontal band of images (built on KineticMarquee). Each
 * tile is fixed-ratio and rounded by the experience radius; speed responds to
 * scroll velocity. Falls back to gradient tiles when no src is given.
 */
export function MarqueeImageStrip({
  images,
  height = 160,
  reverse = false,
  className = "",
}: {
  images: StripImage[];
  height?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <KineticMarquee reverse={reverse} separator="" className={className}>
      <span className="flex items-center gap-4">
        {images.map((img, i) => (
          <span
            key={i}
            className="relative block shrink-0 overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15"
            style={{ height, width: height * 1.4 }}
          >
            {img.src ? (
              <Image src={img.src} alt={img.alt} fill sizes="240px" className="object-cover" />
            ) : (
              <span
                aria-hidden
                className="block h-full w-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent2))]"
              />
            )}
          </span>
        ))}
      </span>
    </KineticMarquee>
  );
}
