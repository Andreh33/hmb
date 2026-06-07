"use client";

import { useMemo } from "react";
import { MOCK_CATEGORIES, MOCK_MENU, MOCK_SITE_CONFIG } from "./mock";
import type { Category, MenuItem, SiteConfig } from "./types";

// Client-side data hooks. A-DATA swaps the mock source for Supabase queries
// behind this same interface (server fetch + RLS), so callers don't change.

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
