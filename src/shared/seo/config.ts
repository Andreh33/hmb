// Central SEO configuration. Server-safe (no "use client").
// The canonical origin is env-driven so the same template deploys per client
// without code changes. Falls back to a neutral localhost origin in dev.

import { routing, type Locale } from "@/i18n/routing";

/** Ordered list of supported locales, mirrors next-intl routing. */
export const SEO_LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/** Map our locale codes to BCP-47 / OpenGraph locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

/**
 * Absolute origin used for canonical URLs, sitemap, OG images.
 * Set NEXT_PUBLIC_SITE_URL in the deployment env (e.g. https://sear.example).
 */
export function siteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
  // Strip a trailing slash so we can safely concatenate paths.
  return withProto.replace(/\/+$/, "");
}

/** Build an absolute URL for a path or relative asset. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${clean}`;
}

/**
 * Locale-prefixed path. routing uses `as-needed`, so the default locale (es)
 * lives at the root and other locales are prefixed (/en).
 */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.replace(/^\//, "/");
  if (locale === DEFAULT_LOCALE) return clean === "" ? "/" : clean;
  return `/${locale}${clean}`;
}

export type { Locale };
