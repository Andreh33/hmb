"use client";

/**
 * Token-styled loading placeholder with a sweeping shimmer. Reduced-motion
 * shows a static muted block. Use the `lines` helper or compose blocks.
 */
export function Skeleton({
  className = "",
  rounded = "var(--radius)",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      aria-hidden
      className={`relative block overflow-hidden bg-[var(--color-muted)]/12 ${className}`}
      style={{ borderRadius: rounded }}
    >
      <span
        className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-text)_10%,transparent),transparent)] motion-reduce:hidden"
        style={{ animation: "sear-shimmer 1.4s ease-in-out infinite" }}
      />
      <style>{`@keyframes sear-shimmer{100%{transform:translateX(100%)}}`}</style>
    </span>
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <span className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Cargando">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-3" rounded="999px" />
      ))}
    </span>
  );
}
