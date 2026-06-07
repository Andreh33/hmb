// Server Component. Emits the JSON-LD graph (Restaurant/Menu/MenuItem +
// WebSite) for the home page. No "use client" — renders pure <script> tags so
// the structured data is in the initial HTML for crawlers. Safe to drop into
// page.tsx; renders nothing visible and never touches the existing tree.

import { resolveHeroManifest } from "@/shared/hero/manifest";
import type { Locale } from "@/i18n/routing";
import { getMenuData, getSiteConfig } from "./data";
import { buildRestaurantSchema, buildWebSiteSchema } from "./schema";

interface JsonLdProps {
  locale: Locale;
}

export function JsonLd({ locale }: JsonLdProps) {
  const site = getSiteConfig();
  const { categories, items } = getMenuData();
  const manifest = resolveHeroManifest(site.hero);

  const restaurant = buildRestaurantSchema({
    locale,
    site,
    categories,
    items,
    heroImage: manifest.still,
  });
  const website = buildWebSiteSchema(locale, site);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe; no user input is interpolated.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
