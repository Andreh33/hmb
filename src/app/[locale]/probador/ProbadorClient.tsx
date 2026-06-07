"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  EXPERIENCE_ORDER,
  EXPERIENCES,
  isExperienceId,
  type ExperienceId,
  type ExperienceMeta,
} from "@/experiences/registry";
import { HeroStage } from "@/shared/hero/HeroStage";
import { PLACEHOLDER_MANIFEST, type HeroManifest } from "@/shared/hero/manifest";
import { buildWhatsAppOrder } from "@/shared/convert/whatsapp";
import { useMenu } from "@/shared/data/useMenu";
import type { Locale } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// A-SALES · Brand-preview de venta (§11)
// Un dueño de restaurante escribe su nombre, sube su logo, elige una de las 5
// experiencias, ajusta el acento y suelta UNA foto de hamburguesa → ve su web
// (hero + cabecera + carta) montarse EN VIVO. Comparte la config por URL y
// abre WhatsApp con Latech. Reutiliza HeroStage y los tokens del proyecto.
// ---------------------------------------------------------------------------

const DEFAULT_BRAND = "Tu Burger";
// Número neutro de contacto (placeholder; se sustituye por el real de Latech en
// configuración). NO es un dato inventado de marca, es el canal de venta.
const LATECH_WHATSAPP = "+34600000000";

const BADGE_LABEL: Record<string, { es: string; en: string }> = {
  nuevo: { es: "Nuevo", en: "New" },
  picante: { es: "Picante", en: "Spicy" },
  veggie: { es: "Veggie", en: "Veggie" },
};

/** A subtle, theme-aware contrast color for text drawn on the accent. */
function onAccent(meta: ExperienceMeta): string {
  return meta.mode === "light" ? "#FFFFFF" : meta.colors.bg;
}

/** Scopes every experience token onto a subtree so Tailwind var(--color-*) and
 *  font-display resolve to THIS preview's palette, independent of the page. */
function previewVars(meta: ExperienceMeta, accent: string): CSSProperties {
  return {
    ["--bg" as string]: meta.colors.bg,
    ["--surface" as string]: meta.colors.surface,
    ["--text" as string]: meta.colors.text,
    ["--muted" as string]: meta.colors.muted,
    ["--accent" as string]: accent,
    ["--accent2" as string]: meta.colors.accent2,
    ["--glaze" as string]: accent,
    ["--display" as string]: meta.fonts.display,
    ["--body" as string]: meta.fonts.body,
    ["--radius" as string]: meta.radius,
    ["--glow" as string]: String(meta.glow),
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--body)",
  } as CSSProperties;
}

export function ProbadorClient() {
  const t = useTranslations("preview");
  const locale = useLocale() as Locale;
  const { items } = useMenu();

  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [exp, setExp] = useState<ExperienceId>("smash");
  const [accent, setAccent] = useState<string>(EXPERIENCES.smash.colors.accent);
  const [photo, setPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const meta = EXPERIENCES[exp];

  // --- Read shared config from the querystring on first load ---------------
  useEffect(() => {
    // Intentional: hydrate the tester from the shared-link querystring, which is
    // only available on the client. Runs once on mount to seed the controls.
    /* eslint-disable react-hooks/set-state-in-effect */
    const p = new URLSearchParams(window.location.search);
    const b = p.get("brand");
    const e = p.get("exp");
    const a = p.get("accent");
    if (b) setBrand(b);
    if (e && isExperienceId(e)) {
      setExp(e);
      setAccent(EXPERIENCES[e].colors.accent);
    }
    if (a && /^#[0-9a-fA-F]{6}$/.test(a)) setAccent(a);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Revoke object URLs to avoid leaks when swapping uploads.
  const photoUrlRef = useRef<string | null>(null);
  const logoUrlRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
    },
    [],
  );

  const handlePhoto = useCallback((file: File | undefined) => {
    if (!file) return;
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    setPhoto(url);
  }, []);

  const handleLogo = useCallback((file: File | undefined) => {
    if (!file) return;
    if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
    const url = URL.createObjectURL(file);
    logoUrlRef.current = url;
    setLogo(url);
  }, []);

  // The uploaded burger photo feeds the hero STILL instantly (HeroStage 'still'
  // mode). With no upload we fall back to the neutral placeholder manifest.
  const manifest = useMemo<HeroManifest>(() => {
    if (!photo) return { ...PLACEHOLDER_MANIFEST, mode: "still" };
    return { mode: "still", still: photo, focal: [0.5, 0.5] };
  }, [photo]);

  const pickExperience = useCallback((id: ExperienceId) => {
    setExp(id);
    setAccent(EXPERIENCES[id].colors.accent);
  }, []);

  // --- Share: build a URL with the config querystring ----------------------
  const share = useCallback(async () => {
    const p = new URLSearchParams({ brand, exp, accent });
    const url = `${window.location.origin}${window.location.pathname}?${p.toString()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: brand, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // User dismissed the share sheet — no-op.
    }
  }, [brand, exp, accent]);

  // --- WhatsApp to Latech --------------------------------------------------
  const whatsappHref = useMemo(() => {
    const styleLine = `${meta.brand} · ${meta.tagline}`;
    const greeting = () => t("contactMessage");
    return buildWhatsAppOrder(
      LATECH_WHATSAPP,
      [{ name: `${brand} (${styleLine})`, qty: 1, price: 0 }],
      brand,
      {
        greeting,
        totalLabel: t("eyebrow"),
        notes: `Acento ${accent}`,
        notesLabel: t("accentLabel"),
      },
    );
  }, [brand, meta, accent, t]);

  const reset = useCallback(() => {
    setBrand(DEFAULT_BRAND);
    pickExperience("smash");
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
    photoUrlRef.current = null;
    logoUrlRef.current = null;
    setPhoto(null);
    setLogo(null);
  }, [pickExperience]);

  // Three signature items for the carta strip in the preview.
  const previewItems = items.slice(0, 3);
  const ink = onAccent(meta);

  return (
    <main className="min-h-screen px-4 py-24 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[clamp(320px,28vw,400px)_1fr]">
        {/* ============================ CONTROLS ============================ */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--color-accent)]">
            {t("configure")}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[0.95] md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">{t("subtitle")}</p>

          {/* Brand name */}
          <label className="mt-9 block text-sm font-medium">
            {t("brandLabel")}
          </label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={t("brandPlaceholder")}
            className="mt-2 w-full rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-[var(--color-surface)] px-4 py-3 text-lg outline-none transition focus:border-[var(--color-accent)]"
          />

          {/* Experience picker — 5 swatches */}
          <label className="mt-7 block text-sm font-medium">
            {t("experienceLabel")}
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXPERIENCE_ORDER.map((id) => {
              const m = EXPERIENCES[id];
              const active = id === exp;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pickExperience(id)}
                  data-active={active}
                  className="group flex items-center gap-3 rounded-[var(--radius)] border px-3 py-2.5 text-left transition data-[active=false]:border-[var(--color-muted)]/25 data-[active=true]:border-[var(--color-accent)] data-[active=true]:bg-[var(--color-accent)]/10"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)]"
                    style={{ background: m.colors.bg }}
                  >
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{
                        background: m.colors.accent,
                        boxShadow: `0 0 10px ${m.colors.accent}`,
                      }}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block truncate text-sm font-semibold"
                      style={{ fontFamily: m.fonts.display }}
                    >
                      {m.brand}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--color-muted)]">
                      {m.tagline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Accent */}
          <label className="mt-7 block text-sm font-medium">
            {t("accentLabel")}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              aria-label={t("accentLabel")}
              className="h-11 w-16 cursor-pointer rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent p-1"
            />
            <code className="text-sm uppercase text-[var(--color-muted)]">
              {accent}
            </code>
          </div>

          {/* Logo + Photo uploads */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">
                {t("logoLabel")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogo(e.target.files?.[0])}
                className="mt-2 block w-full text-xs text-[var(--color-muted)] file:mr-3 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-xs file:text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                {t("photoLabel")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
                className="mt-2 block w-full text-xs text-[var(--color-muted)] file:mr-3 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-xs file:text-[var(--color-text)]"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {t("photoHint")}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={share}
              className="sear-glow w-full rounded-[var(--radius)] bg-[var(--color-accent)] px-5 py-3.5 font-semibold text-[var(--color-bg)] transition active:scale-[0.98]"
            >
              {copied ? t("copied") : t("share")}
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--color-accent)] px-5 py-3.5 font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/10"
            >
              <WhatsAppIcon />
              {t("contact")}
            </a>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-text)] hover:underline"
            >
              {t("reset")}
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]/80">
            {t("shareNote")}
          </p>
        </aside>

        {/* ========================= LIVE PREVIEW ========================== */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </span>
            {t("livePreview")}
          </div>

          {/* The token-scoped device frame. Everything inside reads THIS
              preview's palette/fonts via the scoped CSS vars. */}
          <div
            key={exp}
            data-mode={meta.mode}
            style={previewVars(meta, accent)}
            className="motion-safe:animate-[searFade_0.5s_ease] overflow-hidden rounded-2xl border border-[var(--color-muted)]/15 shadow-2xl ring-1 ring-black/5"
          >
            {/* Site chrome / nav */}
            <header className="flex items-center justify-between gap-4 border-b border-[var(--color-muted)]/10 px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-[var(--radius)] object-contain"
                  />
                ) : null}
                <span
                  className="truncate text-2xl"
                  style={{ fontFamily: "var(--display)" }}
                >
                  {brand || t("brandPlaceholder")}
                </span>
              </div>
              <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] sm:flex">
                <span>{t("menuTitle")}</span>
                <span
                  className="rounded-[var(--radius)] px-4 py-2 font-medium"
                  style={{ background: "var(--accent)", color: ink }}
                >
                  {t("heroCtaSecondary")}
                </span>
              </nav>
            </header>

            {/* HERO — reused HeroStage fed live by the uploaded photo */}
            <div className="relative aspect-[16/10] w-full md:aspect-[16/8]">
              <HeroStage
                manifest={manifest}
                prefer="still"
                glazeColor={accent}
                glaze
                className="absolute inset-0"
              />
              {/* Legibility scrim, themed to bg */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to top, var(--bg) 2%, color-mix(in srgb, var(--bg) 30%, transparent) 32%, transparent 60%)`,
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <p
                  className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
                  style={{ color: "var(--accent)" }}
                >
                  {t("eyebrow")}
                </p>
                <h2
                  className="max-w-[12ch] text-5xl leading-[0.9] md:text-7xl"
                  style={{ fontFamily: "var(--display)", color: "var(--text)" }}
                >
                  {brand || t("brandPlaceholder")}
                </h2>
                <p className="mt-4 max-w-md text-sm text-[var(--color-muted)] md:text-base">
                  {meta.tagline}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span
                    className="sear-glow rounded-[var(--radius)] px-5 py-3 text-sm font-semibold"
                    style={{ background: "var(--accent)", color: ink }}
                  >
                    {t("heroCta")}
                  </span>
                  <span className="rounded-[var(--radius)] border border-[var(--color-text)]/30 px-5 py-3 text-sm font-semibold text-[var(--color-text)]">
                    {t("heroCtaSecondary")}
                  </span>
                </div>
              </div>
            </div>

            {/* CARTA preview strip */}
            <div className="px-6 py-10 md:px-10 md:py-14">
              <h3
                className="text-3xl md:text-4xl"
                style={{ fontFamily: "var(--display)" }}
              >
                {t("menuTitle")}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {t("menuSubtitle")}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {previewItems.map((it) => (
                  <article
                    key={it.id}
                    className="flex flex-col rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        className="text-xl leading-tight"
                        style={{ fontFamily: "var(--display)" }}
                      >
                        {it.name[locale]}
                      </h4>
                      <span
                        className="shrink-0 text-lg font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        {(it.priceCents / 100).toFixed(2)}€
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-xs text-[var(--color-muted)]">
                      {it.desc[locale]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {it.badges.map((b) => (
                        <span
                          key={b}
                          className="rounded-full px-2 py-0.5 text-[10px]"
                          style={{
                            background: `color-mix(in srgb, var(--accent) 18%, transparent)`,
                            color: "var(--accent)",
                          }}
                        >
                          {BADGE_LABEL[b]?.[locale] ?? b}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              {/* Order bar mock */}
              <div className="mt-8 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] px-5 py-4">
                <span className="text-sm text-[var(--color-muted)]">
                  {brand || t("brandPlaceholder")}
                </span>
                <span
                  className="sear-glow rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold"
                  style={{ background: "var(--accent)", color: ink }}
                >
                  {t("orderCta")}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
            {t("tip")}
          </p>
        </section>
      </div>

      <style>{`@keyframes searFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
