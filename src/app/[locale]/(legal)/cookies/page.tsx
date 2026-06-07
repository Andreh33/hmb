// Política de Cookies (RGPD/LOPDGDD art. 22.2 LSSI; guía AEPD). Texto de
// plantilla bilingüe vía next-intl. Sin terceros antes del consentimiento.
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalSection, LegalUpdated } from "../legal-ui";
import { ManageCookiesButton } from "../ManageCookiesButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("cookiePolicyTitle"), robots: { index: true, follow: true } };
}

export default async function CookiesPage({
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
        {t("cookiePolicyTitle")}
      </h1>
      <LegalUpdated label={t("lastUpdated")} placeholder="[fecha]" />

      <LegalSection title={t("cookiesWhatTitle")}>
        <p>{t("cookiesWhatBody")}</p>
      </LegalSection>

      <LegalSection title={t("cookiesConsentTitle")}>
        <p>{t("cookiesConsentBody")}</p>
      </LegalSection>

      <LegalSection title={t("cookiesTypesTitle")}>
        <p>{t("cookiesTypesBody")}</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-[var(--color-text)]">
              {t("catNecessaryTitle")}
            </strong>
            : {t("cookiesTypeNecessary")}
          </li>
          <li>
            <strong className="text-[var(--color-text)]">
              {t("catAnalyticsTitle")}
            </strong>
            : {t("cookiesTypeAnalytics")}
          </li>
          <li>
            <strong className="text-[var(--color-text)]">
              {t("catMarketingTitle")}
            </strong>
            : {t("cookiesTypeMarketing")}
          </li>
        </ul>
      </LegalSection>

      <LegalSection title={t("cookiesTableTitle")}>
        <p>{t("cookiesTableIntro")}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] text-[var(--color-text)]">
                <th className="py-2 pr-3 font-medium">{t("cookiesColName")}</th>
                <th className="py-2 pr-3 font-medium">{t("cookiesColProvider")}</th>
                <th className="py-2 pr-3 font-medium">{t("cookiesColPurpose")}</th>
                <th className="py-2 font-medium">{t("cookiesColDuration")}</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-muted)]">
              <tr className="border-b border-[color-mix(in_srgb,var(--color-muted)_12%,transparent)]">
                <td className="py-2 pr-3 font-mono">sear_cookie_consent</td>
                <td className="py-2 pr-3">{t("cookiesRowFirstParty")}</td>
                <td className="py-2 pr-3">{t("cookiesRowConsentPurpose")}</td>
                <td className="py-2">{t("cookiesRowConsentDuration")}</td>
              </tr>
              <tr className="border-b border-[color-mix(in_srgb,var(--color-muted)_12%,transparent)]">
                <td className="py-2 pr-3 font-mono">sear_exp</td>
                <td className="py-2 pr-3">{t("cookiesRowFirstParty")}</td>
                <td className="py-2 pr-3">{t("cookiesRowExpPurpose")}</td>
                <td className="py-2">{t("cookiesRowExpDuration")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono">[nombre]</td>
                <td className="py-2 pr-3">[proveedor]</td>
                <td className="py-2 pr-3">[finalidad]</td>
                <td className="py-2">[duración]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title={t("cookiesManageTitle")}>
        <p>{t("cookiesManageBody")}</p>
        <ManageCookiesButton label={t("managePreferences")} />
        <p className="mt-4">{t("cookiesBrowserBody")}</p>
      </LegalSection>

      <LegalSection title={t("cookiesChangesTitle")}>
        <p>{t("cookiesChangesBody")}</p>
      </LegalSection>

      <p className="mt-10 text-xs text-[var(--color-muted)]/70">
        {t("templateDisclaimer")}
      </p>
    </>
  );
}
