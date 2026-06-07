// Server-safe data access for SEO/JSON-LD. The UI uses the client hooks
// useMenu()/useSiteConfig(); those are "use client" (useMemo) so they cannot run
// in a Server Component. We read the SAME mock source here behind equivalent
// pure functions, preserving the data contract. When A-DATA swaps the mock for
// Supabase, this file becomes an async server fetch with no caller changes.

import { MOCK_CATEGORIES, MOCK_MENU, MOCK_SITE_CONFIG } from "@/shared/data/mock";
import type { Category, MenuItem, SiteConfig } from "@/shared/data/types";

export function getMenuData(): { categories: Category[]; items: MenuItem[] } {
  return {
    categories: [...MOCK_CATEGORIES].sort((a, b) => a.sort - b.sort),
    items: MOCK_MENU.filter((m) => m.isPublished).sort((a, b) => a.sort - b.sort),
  };
}

export function getSiteConfig(): SiteConfig {
  return MOCK_SITE_CONFIG;
}

export type { Category, MenuItem, SiteConfig };
