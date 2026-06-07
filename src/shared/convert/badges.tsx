import type { ReactElement, ReactNode, SVGProps } from "react";
import type { Locale } from "@/i18n/routing";

/**
 * Menu badges (nuevo / picante / veggie + a couple of neutral extras).
 * Inline SVG glyphs, currentColor. Each badge carries its own tonal class so
 * the row stays legible without inventing new tokens.
 */

export type BadgeKey = "nuevo" | "picante" | "veggie" | "chef" | "popular";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

interface BadgeDef {
  label: Record<Locale, string>;
  /** Tailwind tonal classes (text + subtle bg) layered over surface. */
  tone: string;
  Icon: IconComponent;
}

const glyph = (children: ReactNode): IconComponent =>
  function Icon(props: SVGProps<SVGSVGElement>): ReactElement {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  };

const Nuevo = glyph(
  <path d="M12 3l2.2 5.4L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.6L12 3Z" />,
);

const Picante = glyph(
  <>
    <path d="M7 14c0 3 2.5 5 5.5 5S18 16 18 12c0-2-1-4-3-5-1 2-3 2-5 3-2 1-3 2-3 4Z" />
    <path d="M16 7c.5-2 2-3 3.5-2.8C19 6 18 7 16 7Z" />
  </>,
);

const Veggie = glyph(
  <>
    <path d="M5 13c4-1 7 2 6 6-4 1-7-2-6-6Z" />
    <path d="M11 19c0-7 4-12 9-13 0 7-4 12-9 13Z" />
  </>,
);

const Chef = glyph(
  <>
    <path d="M7 14a4 4 0 0 1-1-7.9A4 4 0 0 1 13.5 5 4 4 0 0 1 18 6a3.5 3.5 0 0 1-1 7H7Z" />
    <path d="M7 14v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4" />
  </>,
);

const Popular = glyph(
  <path d="M12 21c-1-6-6-6-6-11a6 6 0 0 1 12 0c0 5-5 5-6 11Z" />,
);

export const BADGES: Record<BadgeKey, BadgeDef> = {
  nuevo: {
    label: { es: "Nuevo", en: "New" },
    tone: "text-[var(--color-accent)] bg-[var(--color-accent)]/12",
    Icon: Nuevo,
  },
  picante: {
    label: { es: "Picante", en: "Spicy" },
    tone: "text-[#ff6a3d] bg-[#ff6a3d]/12",
    Icon: Picante,
  },
  veggie: {
    label: { es: "Veggie", en: "Veggie" },
    tone: "text-[#5fbf6a] bg-[#5fbf6a]/12",
    Icon: Veggie,
  },
  chef: {
    label: { es: "De autor", en: "Chef's" },
    tone: "text-[var(--color-accent2)] bg-[var(--color-accent2)]/12",
    Icon: Chef,
  },
  popular: {
    label: { es: "Top ventas", en: "Best seller" },
    tone: "text-[var(--color-accent2)] bg-[var(--color-accent2)]/12",
    Icon: Popular,
  },
};

export function isBadgeKey(slug: string): slug is BadgeKey {
  return slug in BADGES;
}

export function Badge({
  badge,
  locale,
}: {
  badge: string;
  locale: Locale;
}): ReactElement {
  if (isBadgeKey(badge)) {
    const def = BADGES[badge];
    const Icon = def.Icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${def.tone}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {def.label[locale]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/12 px-2.5 py-1 text-xs text-[var(--color-accent)]">
      {badge}
    </span>
  );
}
