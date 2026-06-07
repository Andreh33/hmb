import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { Providers } from "@/app/providers";
import { FONT_VARIABLES } from "@/app/fonts";
import {
  DEFAULT_EXPERIENCE,
  EXPERIENCES,
  isExperienceId,
  type ExperienceId,
} from "@/experiences/registry";

export const metadata: Metadata = {
  title: "SEAR · Hamburguesería premium",
  description:
    "Cinco experiencias, una hamburguesería. Plantilla web premium por Latech.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const raw = cookieStore.get("sear_exp")?.value;
  const initial: ExperienceId =
    raw && isExperienceId(raw) ? raw : DEFAULT_EXPERIENCE;
  const meta = EXPERIENCES[initial];

  // Inline the initial token vars on <html> for zero-flash SSR.
  const inlineVars = {
    ["--bg"]: meta.colors.bg,
    ["--surface"]: meta.colors.surface,
    ["--text"]: meta.colors.text,
    ["--muted"]: meta.colors.muted,
    ["--accent"]: meta.colors.accent,
    ["--accent2"]: meta.colors.accent2,
    ["--glaze"]: meta.colors.glaze,
    ["--display"]: meta.fonts.display,
    ["--body"]: meta.fonts.body,
    ["--radius"]: meta.radius,
    ["--glow"]: String(meta.glow),
  } as React.CSSProperties;

  return (
    <html
      lang={locale}
      data-exp={meta.id}
      data-mode={meta.mode}
      data-grain={String(meta.grain)}
      className={FONT_VARIABLES}
      style={inlineVars}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider>
          <Providers initialExperience={initial}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
