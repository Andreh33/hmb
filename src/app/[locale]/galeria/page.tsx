import { setRequestLocale } from "next-intl/server";
import { GalleryClient } from "./GalleryClient";

export default async function GaleriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GalleryClient />;
}
