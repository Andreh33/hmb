import type { MetadataRoute } from "next";
import { absoluteUrl, siteOrigin } from "@/shared/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Legal pages add no search value; keep them out of the index.
      disallow: ["/api/", "/aviso-legal", "/privacidad", "/cookies"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteOrigin(),
  };
}
