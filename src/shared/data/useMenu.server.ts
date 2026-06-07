// Server-side counterparts to the client useMenu()/useSiteConfig() hooks.
// Same return shapes, but they query Supabase (with mock fallback) instead of
// returning the static mock. Use these from Server Components / RSC pages.

import { getCategories, getMenu, getSiteConfig } from "./queries";
import type { Category, MenuItem, SiteConfig } from "./types";

export async function useMenuAsync(): Promise<{
  categories: Category[];
  items: MenuItem[];
}> {
  const [categories, items] = await Promise.all([getCategories(), getMenu()]);
  return { categories, items };
}

export async function useSiteConfigAsync(): Promise<SiteConfig> {
  return getSiteConfig();
}
