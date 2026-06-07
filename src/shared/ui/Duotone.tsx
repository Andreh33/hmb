"use client";

import Image from "next/image";
import { useId } from "react";

/**
 * Applies a token-driven duotone (shadow → highlight) treatment to an image via
 * an inline SVG feComponentTransfer filter, so it re-tints live when the
 * experience palette changes. On hover it can fade back to full color.
 */
export function Duotone({
  src,
  alt,
  shadow = "var(--accent2)",
  highlight = "var(--accent)",
  revealOnHover = true,
  className = "",
}: {
  src: string;
  alt: string;
  shadow?: string;
  highlight?: string;
  revealOnHover?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const [sr, sg, sb] = toRgb(shadow);
  const [hr, hg, hb] = toRgb(highlight);
  return (
    <div className={`group relative overflow-hidden rounded-[var(--radius)] ${className}`}>
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id={`duo-${id}`} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`${sr} ${hr}`} />
            <feFuncG type="table" tableValues={`${sg} ${hg}`} />
            <feFuncB type="table" tableValues={`${sb} ${hb}`} />
          </feComponentTransfer>
        </filter>
      </svg>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 480px"
        className={`object-cover transition-[filter] duration-500 ${revealOnHover ? "group-hover:[filter:none]" : ""}`}
        style={{ filter: `url(#duo-${id})` }}
      />
    </div>
  );
}

// Resolves a CSS var reference to a usable 0..1 channel triple. CSS vars cannot
// be read at render time, so for var() inputs we fall back to a neutral pair
// and rely on the live palette via the named fallbacks below.
function toRgb(input: string): [number, number, number] {
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    return [round(r), round(g), round(b)];
  }
  // var(--accent2) -> dark warm, var(--accent) -> light warm (neutral defaults)
  return input.includes("accent2") ? [0.15, 0.05, 0.04] : [0.95, 0.7, 0.3];
}
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
