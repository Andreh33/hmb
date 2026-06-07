// Metadata API builder per locale. Produces canonical + hreflang alternates
// (es/en + x-default), OpenGraph and Twitter cards using the hero still image.
// Server-safe. Consumed by generateMetadata in app/[locale]/page.tsx.

import type { Metadata } from "next";
import { resolveHeroManifest } from "@/shared/hero/manifest";
import type { Locale } from "@/i18n/routing";
import {
  DEFAULT_LOCALE,
  OG_LOCALE,
  SEO_LOCALES,
  absoluteUrl,
  localePath,
  siteOrigin,
} from "./config";
import { seoCopy } from "./copy";
import { getSiteConfig } from "./data";

/** Build per-locale language alternates map for hreflang. */
function languageAlternates(path = "/"): Record<string, string> {
  const map: Record<string, string> = {};
  for (const loc of SEO_LOCALES) {
    map[loc] = localePath(loc, path);
  }
  // x-default points at the default locale's URL.
  map["x-default"] = localePath(DEFAULT_LOCALE, path);
  return map;
}

export function buildHomeMetadata(locale: Locale): Metadata {
  const copy = seoCopy(locale);
  const site = getSiteConfig();
  const manifest = resolveHeroManifest(site.hero);
  const ogImage = absoluteUrl(manifest.still);
  const canonical = localePath(locale, "/");

  return {
    metadataBase: new URL(siteOrigin()),
    title: copy.title,
    description: copy.description,
    applicationName: site.brand,
    alternates: {
      canonical,
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: site.brand,
      title: copy.title,
      description: copy.description,
      url: canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: SEO_LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: copy.ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}
