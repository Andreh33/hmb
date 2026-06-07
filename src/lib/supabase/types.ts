// Database row shapes (snake_case, as stored in Postgres) and mappers to the
// shared domain types. Keeping this isolated means queries.ts stays readable
// and the public interface (Category/MenuItem/SiteConfig) never leaks SQL shape.

import type { ExperienceId } from "@/experiences/registry";
import type { HeroManifest } from "@/shared/hero/manifest";
import type { Category, MenuItem, SiteConfig } from "@/shared/data/types";

export interface CategoryRow {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  sort: number;
}

export interface MenuItemRow {
  id: string;
  category_id: string;
  name_es: string;
  name_en: string;
  desc_es: string;
  desc_en: string;
  price_cents: number;
  image_url: string | null;
  allergens: string[] | null;
  badges: string[] | null;
  is_published: boolean;
  sort: number;
}

export interface SiteConfigRow {
  id: string;
  experience: string;
  brand: string;
  logo_url: string | null;
  whatsapp: string;
  address: string;
  lat: number;
  lng: number;
  hours: Record<string, string> | null;
  socials: Record<string, string> | null;
  hero: Partial<HeroManifest> | null;
}

const EXPERIENCE_IDS: ReadonlySet<string> = new Set<ExperienceId>([
  "ember",
  "smash",
  "diner",
  "prime",
  "nova",
]);

function asExperienceId(value: string): ExperienceId {
  return (EXPERIENCE_IDS.has(value) ? value : "ember") as ExperienceId;
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { es: row.name_es, en: row.name_en },
    sort: row.sort,
  };
}

export function rowToMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: { es: row.name_es, en: row.name_en },
    desc: { es: row.desc_es, en: row.desc_en },
    priceCents: row.price_cents,
    imageUrl: row.image_url ?? undefined,
    allergens: row.allergens ?? [],
    badges: row.badges ?? [],
    isPublished: row.is_published,
    sort: row.sort,
  };
}

export function rowToSiteConfig(row: SiteConfigRow): SiteConfig {
  return {
    experience: asExperienceId(row.experience),
    brand: row.brand,
    logoUrl: row.logo_url ?? undefined,
    whatsapp: row.whatsapp,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    hours: row.hours ?? {},
    socials: row.socials ?? {},
    hero: row.hero ?? undefined,
  };
}

// Inverse mappers (domain -> row) for the admin CRUD forms.
export function categoryToRow(c: Omit<Category, "id"> & { id?: string }): Partial<CategoryRow> {
  return {
    ...(c.id ? { id: c.id } : {}),
    slug: c.slug,
    name_es: c.name.es,
    name_en: c.name.en,
    sort: c.sort,
  };
}

export function menuItemToRow(
  m: Omit<MenuItem, "id"> & { id?: string },
): Partial<MenuItemRow> {
  return {
    ...(m.id ? { id: m.id } : {}),
    category_id: m.categoryId,
    name_es: m.name.es,
    name_en: m.name.en,
    desc_es: m.desc.es,
    desc_en: m.desc.en,
    price_cents: m.priceCents,
    image_url: m.imageUrl ?? null,
    allergens: m.allergens,
    badges: m.badges,
    is_published: m.isPublished,
    sort: m.sort,
  };
}

export function siteConfigToRow(s: SiteConfig): Partial<SiteConfigRow> {
  return {
    id: "default",
    experience: s.experience,
    brand: s.brand,
    logo_url: s.logoUrl ?? null,
    whatsapp: s.whatsapp,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    hours: s.hours,
    socials: s.socials,
    hero: s.hero ?? null,
  };
}
