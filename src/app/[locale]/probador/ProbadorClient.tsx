"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  EXPERIENCE_ORDER,
  EXPERIENCES,
  type ExperienceId,
} from "@/experiences/registry";

// Brand-preview sales tool (§11). The owner types their name, picks a style,
// tweaks accent, uploads a burger photo → sees their site live. A-SALES deepens
// (share URL, live hero feed, WhatsApp-to-Latech).
export function ProbadorClient() {
  const t = useTranslations("preview");
  const [brand, setBrand] = useState("Tu Burger");
  const [exp, setExp] = useState<ExperienceId>("ember");
  const [accent, setAccent] = useState(EXPERIENCES.ember.colors.accent);
  const [photo, setPhoto] = useState<string | null>(null);

  const meta = EXPERIENCES[exp];

  return (
    <main className="min-h-screen px-5 py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[360px_1fr]">
        <section>
          <h1 className="font-display text-4xl md:text-5xl">{t("title")}</h1>
          <p className="mt-2 text-[var(--color-muted)]">{t("subtitle")}</p>

          <label className="mt-8 block text-sm">{t("brandLabel")}</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent px-4 py-2 outline-none focus:border-[var(--color-accent)]"
          />

          <label className="mt-5 block text-sm">{t("experienceLabel")}</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {EXPERIENCE_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => {
                  setExp(id);
                  setAccent(EXPERIENCES[id].colors.accent);
                }}
                data-active={id === exp}
                className="rounded-[var(--radius)] border border-[var(--color-muted)]/30 px-3 py-1.5 text-xs data-[active=true]:bg-[var(--color-accent)] data-[active=true]:text-[var(--color-bg)]"
              >
                {EXPERIENCES[id].brand}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm">{t("accentLabel")}</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="mt-1 h-10 w-20 cursor-pointer rounded-[var(--radius)] border border-[var(--color-muted)]/30 bg-transparent"
          />

          <label className="mt-5 block text-sm">{t("photoLabel")}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }}
            className="mt-1 w-full text-sm text-[var(--color-muted)]"
          />
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-[var(--color-muted)]/20"
          style={{ background: meta.colors.bg, color: meta.colors.text }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <span
              className="text-2xl"
              style={{ fontFamily: meta.fonts.display }}
            >
              {brand}
            </span>
            <span className="text-xs uppercase tracking-widest" style={{ color: accent }}>
              {meta.tagline}
            </span>
          </div>
          <div
            className="flex aspect-[16/10] items-end p-8"
            style={{
              backgroundImage: photo
                ? `url(${photo})`
                : `linear-gradient(135deg, ${meta.colors.surface}, ${meta.colors.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h2
              className="text-5xl md:text-7xl"
              style={{ fontFamily: meta.fonts.display }}
            >
              {brand}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
            {["La Brasa", "Doble Smash", "Clásica"].map((n) => (
              <div
                key={n}
                className="rounded-[var(--radius)] p-4"
                style={{ background: meta.colors.surface }}
              >
                <p style={{ fontFamily: meta.fonts.display }}>{n}</p>
                <p style={{ color: accent }}>13.90€</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
