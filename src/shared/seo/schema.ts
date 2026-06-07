// JSON-LD builders (schema.org). Pure, server-safe. Emits Restaurant +
// LocalBusiness identity, a Menu with MenuSection/MenuItem, and offers.
// No invented data: ratings/reviews are intentionally omitted (§0.6).

import type { Locale } from "@/i18n/routing";
import { absoluteUrl, localePath, siteOrigin } from "./config";
import { seoCopy } from "./copy";
import type { Category, MenuItem, SiteConfig } from "./data";

const CURRENCY = "EUR";

/** Convert integer cents to a decimal string, e.g. 1450 -> "14.50". */
function priceFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Map Spanish day-range keys ("lun-jue", "vie-sab", "dom") to schema.org day
 * URIs and parse the "13:00–23:30" time string (en-dash or hyphen).
 */
const DAY_URI: Record<string, string> = {
  lun: "https://schema.org/Monday",
  mar: "https://schema.org/Tuesday",
  mie: "https://schema.org/Wednesday",
  "mié": "https://schema.org/Wednesday",
  jue: "https://schema.org/Thursday",
  vie: "https://schema.org/Friday",
  sab: "https://schema.org/Saturday",
  "sáb": "https://schema.org/Saturday",
  dom: "https://schema.org/Sunday",
};

const DAY_SEQUENCE = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

function daysFromKey(key: string): string[] {
  const normalized = key
    .toLowerCase()
    .replace("mié", "mie")
    .replace("sáb", "sab");
  if (normalized.includes("-")) {
    const [start, end] = normalized.split("-");
    const i = DAY_SEQUENCE.indexOf(start ?? "");
    const j = DAY_SEQUENCE.indexOf(end ?? "");
    if (i === -1 || j === -1) return [];
    return DAY_SEQUENCE.slice(i, j + 1)
      .map((d) => DAY_URI[d])
      .filter((u): u is string => Boolean(u));
  }
  const uri = DAY_URI[normalized];
  return uri ? [uri] : [];
}

function parseTimes(value: string): { open: string; close: string } | null {
  const parts = value.split(/[–-]/).map((s) => s.trim());
  const open = parts[0];
  const close = parts[1];
  if (!open || !close) return null;
  return { open, close };
}

function openingHours(hours: SiteConfig["hours"]) {
  const specs: Array<Record<string, unknown>> = [];
  for (const [key, value] of Object.entries(hours)) {
    const days = daysFromKey(key);
    const times = parseTimes(value);
    if (days.length === 0 || !times) continue;
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: times.open,
      closes: times.close,
    });
  }
  return specs;
}

function telFromWhatsapp(whatsapp: string): string {
  // whatsapp is already in +<international> format in the mock.
  return whatsapp.replace(/[^\d+]/g, "");
}

/** Build the MenuItem nodes for a single category. */
function menuItemsFor(
  category: Category,
  items: MenuItem[],
  locale: Locale,
): Array<Record<string, unknown>> {
  return items
    .filter((m) => m.categoryId === category.id)
    .map((m) => ({
      "@type": "MenuItem",
      name: m.name[locale],
      description: m.desc[locale],
      ...(m.imageUrl ? { image: absoluteUrl(m.imageUrl) } : {}),
      offers: {
        "@type": "Offer",
        price: priceFromCents(m.priceCents),
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
      },
    }));
}

export interface SchemaInput {
  locale: Locale;
  site: SiteConfig;
  categories: Category[];
  items: MenuItem[];
  heroImage: string;
}

/**
 * Restaurant node — also acts as LocalBusiness (Restaurant is a subtype of
 * FoodEstablishment ⊂ LocalBusiness) and embeds the full hasMenu graph.
 */
export function buildRestaurantSchema(input: SchemaInput): Record<string, unknown> {
  const { locale, site, categories, items, heroImage } = input;
  const copy = seoCopy(locale);
  const origin = siteOrigin();
  const url = `${origin}${localePath(locale, "/")}`;

  const sections = categories.map((c) => ({
    "@type": "MenuSection",
    name: c.name[locale],
    hasMenuItem: menuItemsFor(c, items, locale),
  }));

  const social = Object.values(site.socials).filter(
    (u) => typeof u === "string" && u.startsWith("http"),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${origin}/#restaurant`,
    name: site.brand,
    description: copy.description,
    url,
    image: absoluteUrl(heroImage),
    servesCuisine: ["Burgers", "American"],
    priceRange: "€€",
    telephone: telFromWhatsapp(site.whatsapp),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.lat,
      longitude: site.lng,
    },
    openingHoursSpecification: openingHours(site.hours),
    ...(social.length > 0 ? { sameAs: social } : {}),
    hasMenu: {
      "@type": "Menu",
      name: copy.menuHeading,
      hasMenuSection: sections,
    },
  };
}

/** WebSite node — enables sitelinks searchbox potential and ties locale URLs. */
export function buildWebSiteSchema(locale: Locale, site: SiteConfig): Record<string, unknown> {
  const origin = siteOrigin();
  const copy = seoCopy(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: site.brand,
    description: copy.description,
    url: `${origin}${localePath(locale, "/")}`,
    inLanguage: locale,
    publisher: { "@id": `${origin}/#restaurant` },
  };
}
