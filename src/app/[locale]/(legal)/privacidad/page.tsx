// Política de Privacidad (RGPD — Reglamento (UE) 2016/679 — y LOPDGDD
// 3/2018). Texto de plantilla bilingüe vía next-intl; marcadores [dato] para
// el cliente. El responsable completa finalidades y base jurídica reales.
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
  return { title: t("privacyTitle"), robots: { index: true, follow: true } };
}

export default async function PrivacidadPage({
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
        {t("privacyTitle")}
      </h1>
      <LegalUpdated label={t("lastUpdated")} placeholder="[fecha]" />

      <LegalSection title={t("privacyControllerTitle")}>
        <p>{t("privacyControllerBody")}</p>
        <ul className="mt-3 space-y-1">
          <li>{t("noticeFieldName")}: [Razón social / nombre comercial]</li>
          <li>{t("noticeFieldNif")}: [NIF / CIF]</li>
          <li>{t("noticeFieldAddress")}: [domicilio]</li>
          <li>{t("privacyDpoLabel")}: [email del responsable / DPO si aplica]</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("privacyDataTitle")}>
        <p>{t("privacyDataBody")}</p>
        <ul className="mt-3 space-y-1">
          <li>{t("privacyDataContact")}</li>
          <li>{t("privacyDataOrder")}</li>
          <li>{t("privacyDataTechnical")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("privacyPurposeTitle")}>
        <p>{t("privacyPurposeBody")}</p>
        <ul className="mt-3 space-y-1">
          <li>{t("privacyPurposeWhatsapp")}</li>
          <li>{t("privacyPurposeContact")}</li>
          <li>{t("privacyPurposeAnalytics")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("privacyLegalBasisTitle")}>
        <p>{t("privacyLegalBasisBody")}</p>
      </LegalSection>

      <LegalSection title={t("privacyRetentionTitle")}>
        <p>{t("privacyRetentionBody")}</p>
      </LegalSection>

      <LegalSection title={t("privacyRecipientsTitle")}>
        <p>{t("privacyRecipientsBody")}</p>
      </LegalSection>

      <LegalSection title={t("privacyRightsTitle")}>
        <p>{t("privacyRightsBody")}</p>
        <ul className="mt-3 space-y-1">
          <li>{t("privacyRightAccess")}</li>
          <li>{t("privacyRightRectification")}</li>
          <li>{t("privacyRightErasure")}</li>
          <li>{t("privacyRightObjection")}</li>
          <li>{t("privacyRightPortability")}</li>
          <li>{t("privacyRightRestriction")}</li>
        </ul>
        <p className="mt-3">{t("privacyRightsHow")}</p>
        <p className="mt-3">{t("privacyComplaint")}</p>
      </LegalSection>

      <LegalSection title={t("privacySecurityTitle")}>
        <p>{t("privacySecurityBody")}</p>
      </LegalSection>

      <p className="mt-10 text-xs text-[var(--color-muted)]/70">
        {t("templateDisclaimer")}
      </p>
    </>
  );
}
