import { setRequestLocale } from "next-intl/server";

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <article className="prose-invert mx-auto max-w-3xl px-5 py-32">
      {children}
    </article>
  );
}
