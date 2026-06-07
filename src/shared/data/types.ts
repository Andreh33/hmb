import type { ExperienceId } from "@/experiences/registry";
import type { HeroManifest } from "@/shared/hero/manifest";

export interface Category {
  id: string;
  slug: string;
  name: { es: string; en: string };
  sort: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: { es: string; en: string };
  desc: { es: string; en: string };
  priceCents: number;
  imageUrl?: string;
  allergens: string[];
  badges: string[];
  isPublished: boolean;
  sort: number;
}

export interface SiteConfig {
  experience: ExperienceId;
  brand: string;
  logoUrl?: string;
  whatsapp: string;
  address: string;
  lat: number;
  lng: number;
  hours: Record<string, string>;
  socials: Record<string, string>;
  hero?: Partial<HeroManifest>;
}
