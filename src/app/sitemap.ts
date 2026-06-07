import type { MetadataRoute } from "next";
import { SEO_LOCALES, absoluteUrl, localePath } from "@/shared/seo/config";

// Routes that exist for every locale. Keep in sync with app/[locale]/*.
const ROUTES = ["/", "/galeria", "/probador"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((route) =>
    SEO_LOCALES.map((locale) => {
      const path = localePath(locale, route);
      // Per-entry hreflang alternates so search engines see the locale graph.
      const languages: Record<string, string> = {};
      for (const alt of SEO_LOCALES) {
        languages[alt] = absoluteUrl(localePath(alt, route));
      }
      return {
        url: absoluteUrl(path),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: route === "/" ? 1 : 0.7,
        alternates: { languages },
      };
    }),
  );
}
