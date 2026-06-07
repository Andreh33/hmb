import type { ReactElement, ReactNode, SVGProps } from "react";

/**
 * Self-contained EU-14 allergen icon set (inline SVG, currentColor).
 * No external icon dependency. Keys match the slugs used in the menu data
 * (`MenuItem.allergens`). Unknown slugs fall through to a neutral dot.
 */

export type AllergenKey =
  | "gluten"
  | "lacteos"
  | "huevo"
  | "soja"
  | "frutos-secos"
  | "cacahuetes"
  | "pescado"
  | "crustaceos"
  | "moluscos"
  | "apio"
  | "mostaza"
  | "sesamo"
  | "sulfitos"
  | "altramuces";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

interface AllergenDef {
  label: { es: string; en: string };
  Icon: IconComponent;
}

const base = (children: ReactNode): IconComponent =>
  function Icon(props: SVGProps<SVGSVGElement>): ReactElement {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  };

const Gluten = base(
  <>
    <path d="M12 3v18" />
    <path d="M12 7c-1.6-1.6-3.5-1.6-4.6-.5C8.5 7.6 10.4 7.6 12 9c1.6-1.4 3.5-1.4 4.6-.5C15.5 5.4 13.6 5.4 12 7Z" />
    <path d="M12 12c-1.6-1.6-3.5-1.6-4.6-.5C8.5 12.6 10.4 12.6 12 14c1.6-1.4 3.5-1.4 4.6-.5C15.5 10.4 13.6 10.4 12 12Z" />
    <path d="M12 17c-1.6-1.6-3.5-1.6-4.6-.5C8.5 17.6 10.4 17.6 12 19c1.6-1.4 3.5-1.4 4.6-.5C15.5 15.4 13.6 15.4 12 17Z" />
  </>,
);

const Lacteos = base(
  <>
    <path d="M8 3h8l-.5 3.5L17 10v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l1.5-3.5L8 3Z" />
    <path d="M7 11h10" />
  </>,
);

const Huevo = base(<path d="M12 3c3.3 0 6 4.5 6 9a6 6 0 1 1-12 0c0-4.5 2.7-9 6-9Z" />);

const Soja = base(
  <>
    <path d="M6 7c5 0 9 3 12 9" />
    <circle cx="9" cy="9" r="2" />
    <circle cx="13" cy="13" r="2" />
    <circle cx="17" cy="17" r="2" />
  </>,
);

const FrutosSecos = base(
  <>
    <path d="M12 3c4 0 7 3 7 7 0 5-3 11-7 11S5 15 5 10c0-4 3-7 7-7Z" />
    <path d="M12 6v12M9 9l6 6M15 9l-6 6" />
  </>,
);

const Cacahuetes = base(
  <>
    <path d="M12 3c2 0 3.5 1.5 3.5 3.5 0 1.2-.6 2-1.2 2.8.6.8 1.2 1.6 1.2 2.8C15.5 16 14 17.5 12 17.5S8.5 16 8.5 14c0-1.2.6-2 1.2-2.8-.6-.8-1.2-1.6-1.2-2.8C8.5 6.5 10 5 12 5Z" />
    <path d="M9.5 8.5h5M9.5 13.5h5M12 18v3" />
  </>,
);

const Pescado = base(
  <>
    <path d="M3 12c3-4 7-5 10-5 0 0 4 0 8 5-4 5-8 5-8 5-3 0-7-1-10-5Z" />
    <path d="M21 7c-2 1.5-3 3.5-3 5s1 3.5 3 5" />
    <circle cx="8" cy="11" r="0.6" fill="currentColor" />
  </>,
);

const Crustaceos = base(
  <>
    <circle cx="12" cy="13" r="3" />
    <path d="M9 11C7 9 6 6 7 4M15 11c2-2 3-5 2-7M9 15c-2 1-4 3-4 5M15 15c2 1 4 3 4 5M9 13H4M15 13h5" />
  </>,
);

const Moluscos = base(
  <>
    <path d="M12 20c-5 0-8-4-8-8a8 8 0 0 1 16 0c0 4-3 8-8 8Z" />
    <path d="M12 20 7 6M12 20l5-14M12 20v-9" />
  </>,
);

const Apio = base(
  <>
    <path d="M12 21V8" />
    <path d="M12 8c0-3 2-5 5-5-1 3-3 5-5 5ZM12 10c0-3-2-5-5-5 1 3 3 5 5 5ZM12 12c0-2 1.5-3.5 3.5-3.5M12 14c0-2-1.5-3.5-3.5-3.5" />
  </>,
);

const Mostaza = base(
  <>
    <path d="M9 21h6l1-9c0-2-1.5-3.5-4-3.5S8 10 8 12l1 9Z" />
    <path d="M12 8.5V5M12 5c0-1 .8-2 2-2" />
  </>,
);

const Sesamo = base(
  <>
    <ellipse cx="9" cy="9" rx="2" ry="3" transform="rotate(-30 9 9)" />
    <ellipse cx="15" cy="11" rx="2" ry="3" transform="rotate(20 15 11)" />
    <ellipse cx="11" cy="15" rx="2" ry="3" transform="rotate(-10 11 15)" />
  </>,
);

const Sulfitos = base(
  <>
    <path d="M12 3l2 4h-4l2-4Z" />
    <path d="M7 21h10l-1.5-9a3.5 3.5 0 0 0-7 0L7 21Z" />
    <path d="M8 14h8" />
  </>,
);

const Altramuces = base(
  <>
    <path d="M12 21c-3 0-5-2-5-5 2 0 4 1 5 3 1-2 3-3 5-3 0 3-2 5-5 5Z" />
    <path d="M12 16c-2.5 0-4-1.5-4-4 1.7 0 3.3.7 4 2 .7-1.3 2.3-2 4-2 0 2.5-1.5 4-4 4Z" />
    <path d="M12 11V4" />
  </>,
);

const Neutral = base(<circle cx="12" cy="12" r="3" fill="currentColor" />);

export const ALLERGENS: Record<AllergenKey, AllergenDef> = {
  gluten: { label: { es: "Gluten", en: "Gluten" }, Icon: Gluten },
  lacteos: { label: { es: "Lácteos", en: "Dairy" }, Icon: Lacteos },
  huevo: { label: { es: "Huevo", en: "Egg" }, Icon: Huevo },
  soja: { label: { es: "Soja", en: "Soy" }, Icon: Soja },
  "frutos-secos": { label: { es: "Frutos secos", en: "Tree nuts" }, Icon: FrutosSecos },
  cacahuetes: { label: { es: "Cacahuetes", en: "Peanuts" }, Icon: Cacahuetes },
  pescado: { label: { es: "Pescado", en: "Fish" }, Icon: Pescado },
  crustaceos: { label: { es: "Crustáceos", en: "Crustaceans" }, Icon: Crustaceos },
  moluscos: { label: { es: "Moluscos", en: "Molluscs" }, Icon: Moluscos },
  apio: { label: { es: "Apio", en: "Celery" }, Icon: Apio },
  mostaza: { label: { es: "Mostaza", en: "Mustard" }, Icon: Mostaza },
  sesamo: { label: { es: "Sésamo", en: "Sesame" }, Icon: Sesamo },
  sulfitos: { label: { es: "Sulfitos", en: "Sulphites" }, Icon: Sulfitos },
  altramuces: { label: { es: "Altramuces", en: "Lupin" }, Icon: Altramuces },
};

export function isAllergenKey(slug: string): slug is AllergenKey {
  return slug in ALLERGENS;
}

/** Resolves an allergen slug to its definition, with a neutral fallback. */
export function resolveAllergen(slug: string): {
  label: { es: string; en: string };
  Icon: IconComponent;
} {
  if (isAllergenKey(slug)) return ALLERGENS[slug];
  return { label: { es: slug, en: slug }, Icon: Neutral };
}
