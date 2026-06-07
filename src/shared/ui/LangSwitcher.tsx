"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LangSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const next: Locale = locale === "es" ? "en" : "es";
  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-full border border-[var(--color-muted)]/25 px-3 py-1.5 text-xs uppercase tracking-wide"
      aria-label={`Switch language to ${next}`}
    >
      {locale}
    </button>
  );
}
