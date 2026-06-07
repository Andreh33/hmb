"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

/**
 * Draggable before/after image comparison. Pointer drag or arrow keys move the
 * divider; the "after" layer is clipped by an imperatively updated inset so the
 * drag stays at 60fps. Keyboard accessible (slider role).
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeAlt = "Before",
  afterAlt = "After",
  className = "",
}: {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const apply = useCallback((p: number) => {
    const c = Math.min(100, Math.max(0, p));
    if (clip.current) clip.current.style.clipPath = `inset(0 ${100 - c}% 0 0)`;
    if (handle.current) handle.current.style.left = `${c}%`;
  }, []);

  const fromEvent = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = ((clientX - r.left) / r.width) * 100;
      setPct(p);
      apply(p);
    },
    [apply],
  );

  return (
    <div
      ref={ref}
      className={`relative select-none overflow-hidden rounded-[var(--radius)] border border-[var(--color-muted)]/15 ${className}`}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        fromEvent(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromEvent(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <ImgFill src={after} alt={afterAlt} />
      <div ref={clip} className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
        <ImgFill src={before} alt={beforeAlt} />
      </div>
      <div
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Comparar antes y después"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            const n = Math.max(0, pct - 4);
            setPct(n);
            apply(n);
          }
          if (e.key === "ArrowRight") {
            const n = Math.min(100, pct + 4);
            setPct(n);
            apply(n);
          }
        }}
        className="absolute top-0 z-10 flex h-full w-0.5 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-[var(--color-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{ left: "50%" }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-text)] text-[var(--color-bg)] shadow">
          ⇄
        </span>
      </div>
    </div>
  );
}

function ImgFill({ src, alt }: { src: string; alt: string }) {
  return src ? (
    <Image src={src} alt={alt} fill sizes="(max-width:768px) 100vw, 560px" className="object-cover" />
  ) : (
    <span
      aria-label={alt}
      role="img"
      className="block h-full w-full bg-[linear-gradient(135deg,var(--color-surface),var(--color-accent))]"
    />
  );
}
