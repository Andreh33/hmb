"use client";

import Image from "next/image";
import { TiltGlareCard } from "./TiltGlareCard";
import { SparkButton } from "./SparkButton";
import { BadgeChip } from "./BadgeChip";

/**
 * Presentational dish card (tilt + glare + spark CTA). Purely props-driven so
 * it never duplicates MenuSection's data wiring — MenuSection can adopt it,
 * the gallery uses it standalone.
 */
export function MenuItemCard({
  name,
  desc,
  price,
  imageUrl,
  badges = [],
  addLabel = "Añadir",
  onAdd,
  className = "",
}: {
  name: string;
  desc: string;
  /** Formatted price string, e.g. "14.50€". */
  price: string;
  imageUrl?: string;
  badges?: string[];
  addLabel?: string;
  onAdd?: () => void;
  className?: string;
}) {
  return (
    <TiltGlareCard className={className} max={8}>
      <article className="flex h-full flex-col p-5">
        {imageUrl ? (
          <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)]">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="mb-4 aspect-[4/3] w-full rounded-[var(--radius)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_30%,transparent),color-mix(in_srgb,var(--color-accent2)_30%,transparent))]"
          />
        )}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight">{name}</h3>
          <span className="shrink-0 font-display text-xl text-[var(--color-accent)]">
            {price}
          </span>
        </div>
        <p className="mb-4 flex-1 text-sm text-[var(--color-muted)]">{desc}</p>
        {badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <BadgeChip key={b}>{b}</BadgeChip>
            ))}
          </div>
        )}
        <SparkButton className="w-full" onClick={onAdd}>
          {addLabel}
        </SparkButton>
      </article>
    </TiltGlareCard>
  );
}
