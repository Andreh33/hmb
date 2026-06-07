import { getServerSupabase } from "@/lib/supabase/server";
import {
  rowToCategory,
  rowToMenuItem,
  rowToSiteConfig,
  type CategoryRow,
  type MenuItemRow,
  type SiteConfigRow,
} from "@/lib/supabase/types";
import { MOCK_CATEGORIES, MOCK_MENU, MOCK_SITE_CONFIG } from "./mock";
import type { Category, MenuItem, SiteConfig } from "./types";

// Server data access. Each function tries Supabase and transparently falls
// back to the mock layer when there is no env, no client, or a query error —
// guaranteeing the build and the demo work with zero backend configured.

export async function getCategories(): Promise<Category[]> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return [...MOCK_CATEGORIES].sort((a, b) => a.sort - b.sort);
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_es, name_en, sort")
    .order("sort", { ascending: true });

  if (error || !data) {
    return [...MOCK_CATEGORIES].sort((a, b) => a.sort - b.sort);
  }

  return (data as CategoryRow[]).map(rowToCategory);
}

export async function getMenu(): Promise<MenuItem[]> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return MOCK_MENU.filter((m) => m.isPublished).sort((a, b) => a.sort - b.sort);
  }

  // RLS exposes only published rows to anon; the filter is belt-and-braces.
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, category_id, name_es, name_en, desc_es, desc_en, price_cents, image_url, allergens, badges, is_published, sort",
    )
    .eq("is_published", true)
    .order("sort", { ascending: true });

  if (error || !data) {
    return MOCK_MENU.filter((m) => m.isPublished).sort((a, b) => a.sort - b.sort);
  }

  return (data as MenuItemRow[]).map(rowToMenuItem);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await getServerSupabase();
  if (!supabase) return MOCK_SITE_CONFIG;

  const { data, error } = await supabase
    .from("site_config")
    .select(
      "id, experience, brand, logo_url, whatsapp, address, lat, lng, hours, socials, hero",
    )
    .limit(1)
    .maybeSingle();

  if (error || !data) return MOCK_SITE_CONFIG;

  return rowToSiteConfig(data as SiteConfigRow);
}

/** Admin variant: all menu items including unpublished (requires auth via RLS). */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return [...MOCK_MENU].sort((a, b) => a.sort - b.sort);
  }

  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, category_id, name_es, name_en, desc_es, desc_en, price_cents, image_url, allergens, badges, is_published, sort",
    )
    .order("sort", { ascending: true });

  if (error || !data) {
    return [...MOCK_MENU].sort((a, b) => a.sort - b.sort);
  }

  return (data as MenuItemRow[]).map(rowToMenuItem);
}
