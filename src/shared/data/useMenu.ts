"use client";

import { useMemo } from "react";
import { MOCK_CATEGORIES, MOCK_MENU, MOCK_SITE_CONFIG } from "./mock";
import type { Category, MenuItem, SiteConfig } from "./types";

// Client-side data hooks. They keep returning mock data so the interface and
// SSR stay stable. Server Components that want live Supabase data (with mock
// fallback) should use the same-shaped `useMenuAsync` / `useSiteConfigAsync`
// from "./useMenu.server", which read through src/shared/data/queries.ts.

export function useMenu(): { categories: Category[]; items: MenuItem[] } {
  return useMemo(
    () => ({
      categories: [...MOCK_CATEGORIES].sort((a, b) => a.sort - b.sort),
      items: MOCK_MENU.filter((m) => m.isPublished).sort((a, b) => a.sort - b.sort),
    }),
    [],
  );
}

export function useSiteConfig(): SiteConfig {
  return MOCK_SITE_CONFIG;
}
