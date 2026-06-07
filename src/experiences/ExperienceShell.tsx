"use client";

import { SiteHeader } from "@/shared/ui/SiteHeader";
import { HeroSection } from "@/shared/ui/HeroSection";
import { MenuSection } from "@/shared/convert/MenuSection";
import {
  LocationSection,
  SiteFooter,
  StorySection,
} from "@/shared/ui/sections";
import { OrderBar } from "@/shared/convert/OrderBar";

/**
 * Baseline page composition shared by all experiences. Each experience's BUILD
 * agent overrides hero treatment, layout, sections and interactions on top of
 * this — and wires its own ScrollFilm storyboard (§7.4). The shell guarantees
 * a coherent, conversion-ready page from day one.
 */
export function ExperienceShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen">
      <SiteHeader />
      <HeroSection />
      {children}
      <MenuSection />
      <StorySection />
      <LocationSection />
      <SiteFooter />
      <OrderBar />
    </main>
  );
}
