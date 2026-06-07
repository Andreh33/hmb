import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ActiveExperience } from "@/experiences/components";
import { CookieBanner } from "@/shared/ui/CookieBanner";
import { JsonLd } from "@/shared/seo/JsonLd";
import { buildHomeMetadata } from "@/shared/seo/metadata";
import { seoCopy } from "@/shared/seo/copy";
import { routing, type Locale } from "@/i18n/routing";

function asLocale(value: string): Locale {
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildHomeMetadata(asLocale(locale));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = asLocale(locale);
  const copy = seoCopy(lang);

  return (
    <>
      {/* Structured data for crawlers — renders nothing visible. */}
      <JsonLd locale={lang} />
      {/* Indexable lead copy: real text in the DOM, visually hidden so it does
          not disturb the cinematic experience render. */}
      <h1 className="sr-only">{copy.title}</h1>
      <p className="sr-only">{copy.intro}</p>
      <ActiveExperience />
      <CookieBanner />
    </>
  );
}
