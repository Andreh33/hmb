"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import { LangSwitcher } from "./LangSwitcher";
import { useExperience } from "@/experiences/ExperienceProvider";

export function SiteHeader() {
  const t = useTranslations("nav");
  const { meta } = useExperience();
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-5 py-4">
      <Link href="/" className="font-display text-2xl tracking-tight">
        {meta.brand}
      </Link>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <a href="#carta" className="hover:text-[var(--color-accent)]">
          {t("menu")}
        </a>
        <Link href="/galeria" className="hover:text-[var(--color-accent)]">
          {t("gallery")}
        </Link>
        <Link href="/probador" className="hover:text-[var(--color-accent)]">
          {t("preview")}
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <ExperienceToggle />
        <LangSwitcher />
      </div>
    </header>
  );
}
