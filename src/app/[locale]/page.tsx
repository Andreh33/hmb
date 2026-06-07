import { setRequestLocale } from "next-intl/server";
import { ActiveExperience } from "@/experiences/components";
import { CookieBanner } from "@/shared/ui/CookieBanner";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ActiveExperience />
      <CookieBanner />
    </>
  );
}
