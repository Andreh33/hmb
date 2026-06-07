import { setRequestLocale } from "next-intl/server";
import { ProbadorClient } from "./ProbadorClient";

export default async function ProbadorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProbadorClient />;
}
