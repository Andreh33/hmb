// Aviso Legal (LSSI-CE, Ley 34/2002). Texto de plantilla bilingüe vía next-intl.
// Los marcadores [dato] los sustituye el cliente con sus datos reales antes de
// publicar. Cero datos inventados.
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalSection, LegalUpdated } from "../legal-ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("noticeTitle"), robots: { index: true, follow: true } };
}

export default async function AvisoLegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        {t("noticeTitle")}
      </h1>
      <LegalUpdated label={t("lastUpdated")} placeholder="[fecha]" />

      <LegalSection title={t("noticeIdentTitle")}>
        <p>{t("noticeIdentBody")}</p>
        <ul className="mt-3 space-y-1">
          <li>{t("noticeFieldName")}: [Razón social / nombre comercial]</li>
          <li>{t("noticeFieldNif")}: [NIF / CIF]</li>
          <li>{t("noticeFieldAddress")}: [domicilio social]</li>
          <li>{t("noticeFieldEmail")}: [email de contacto]</li>
          <li>{t("noticeFieldPhone")}: [teléfono]</li>
          <li>{t("noticeFieldRegistry")}: [datos registrales, si aplica]</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("noticeObjectTitle")}>
        <p>{t("noticeObjectBody")}</p>
      </LegalSection>

      <LegalSection title={t("noticeUseTitle")}>
        <p>{t("noticeUseBody")}</p>
      </LegalSection>

      <LegalSection title={t("noticeIpTitle")}>
        <p>{t("noticeIpBody")}</p>
      </LegalSection>

      <LegalSection title={t("noticeLiabilityTitle")}>
        <p>{t("noticeLiabilityBody")}</p>
      </LegalSection>

      <LegalSection title={t("noticeLinksTitle")}>
        <p>{t("noticeLinksBody")}</p>
      </LegalSection>

      <LegalSection title={t("noticeLawTitle")}>
        <p>{t("noticeLawBody")}</p>
      </LegalSection>

      <p className="mt-10 text-xs text-[var(--color-muted)]/70">
        {t("templateDisclaimer")}
      </p>
    </>
  );
}
