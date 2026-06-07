"use client";

import Image from "next/image";
import { type ReactNode } from "react";

/**
 * Slow, cinematic pan-and-zoom (Ken Burns) over an image, with an optional
 * gradient scrim for overlaid text. Pure CSS keyframes (defined inline) so it
 * costs nothing on the main thread; pauses under reduced-motion.
 */
export function KenBurns({
  src,
  alt,
  duration = 18,
  scrim = true,
  children,
  className = "",
}: {
  src: string;
  alt: string;
  /** seconds for one pan cycle. */
  duration?: number;
  scrim?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[var(--radius)] ${className}`}>
      <div
        className="absolute inset-0 motion-reduce:!animate-none"
        style={{ animation: `sear-kenburns ${duration}s ease-in-out infinite alternate` }}
      >
        {src ? (
          <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority={false} />
        ) : (
          <span
            aria-label={alt}
            role="img"
            className="block h-full w-full bg-[radial-gradient(120%_120%_at_30%_20%,var(--color-accent),var(--color-surface))]"
          />
        )}
      </div>
      {scrim && (
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-bg)_85%,transparent),transparent_60%)]"
        />
      )}
      {children && <div className="relative z-10 flex h-full items-end p-6">{children}</div>}
      <style>{`@keyframes sear-kenburns{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.18) translate(-3%,-2%)}}`}</style>
    </div>
  );
}
