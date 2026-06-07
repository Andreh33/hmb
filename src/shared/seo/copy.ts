// Self-contained bilingual SEO copy. Kept here (not in messages/*.json) so the
// SEO surface owns its own indexable text without coupling to UI translation
// files. Neutral wording only — no invented reviews, awards, or figures (§0.6).

import type { Locale } from "@/i18n/routing";

export interface SeoCopy {
  title: string;
  description: string;
  ogAlt: string;
  /** Visible, indexable lead paragraph rendered into the DOM. */
  intro: string;
  menuHeading: string;
}

export const SEO_COPY: Record<Locale, SeoCopy> = {
  es: {
    title: "SEAR · Hamburguesería premium",
    description:
      "Carne madurada, pan brioche y fuego. Cinco experiencias, una hamburguesería. Consulta la carta y pide por WhatsApp.",
    ogAlt: "Hamburguesa gourmet de SEAR sobre fondo oscuro",
    intro:
      "SEAR es una hamburguesería premium: carne madurada, pan brioche artesano y cocción al fuego. Descubre la carta de hamburguesas de autor, clásicas y acompañamientos, y haz tu pedido en segundos.",
    menuHeading: "Carta",
  },
  en: {
    title: "SEAR · Premium burger house",
    description:
      "Aged beef, brioche bun and fire. Five experiences, one burger house. Browse the menu and order via WhatsApp.",
    ogAlt: "SEAR gourmet burger on a dark background",
    intro:
      "SEAR is a premium burger house: aged beef, artisan brioche buns and fire-cooked patties. Explore the menu of signature and classic burgers plus sides, and place your order in seconds.",
    menuHeading: "Menu",
  },
};

export function seoCopy(locale: Locale): SeoCopy {
  return SEO_COPY[locale];
}
