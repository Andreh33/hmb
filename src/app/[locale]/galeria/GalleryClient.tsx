"use client";

import { useTranslations } from "next-intl";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import { Magnetic, Reveal, SplitText } from "@/shared/motion/primitives";

// Component gallery (kitchen-sink). A-GALLERY expands this to the full 52
// components (§9), each re-styled live across the 5 experiences.
function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] p-6">
      <p className="mb-4 text-xs uppercase tracking-widest text-[var(--color-muted)]">
        {title}
      </p>
      <div className="flex min-h-24 items-center justify-center">{children}</div>
    </div>
  );
}

export function GalleryClient() {
  const t = useTranslations("gallery");
  return (
    <main className="min-h-screen px-5 py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl md:text-7xl">{t("title")}</h1>
            <p className="mt-2 text-[var(--color-muted)]">{t("subtitle")}</p>
          </div>
          <ExperienceToggle />
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Demo title="MagneticButton">
            <Magnetic>
              <button className="sear-glow rounded-[var(--radius)] bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-bg)]">
                Pedir ahora
              </button>
            </Magnetic>
          </Demo>
          <Demo title="SplitColorShift">
            <span className="font-display text-4xl">
              <SplitText text="SABOR" />
            </span>
          </Demo>
          <Demo title="RevealCard">
            <Reveal>
              <div className="rounded-[var(--radius)] border border-[var(--color-accent)]/40 px-6 py-8 text-center font-display text-2xl">
                14.50€
              </div>
            </Reveal>
          </Demo>
        </div>
        <p className="mt-10 text-sm text-[var(--color-muted)]">
          Galería base — A-GALLERY la completa a 52 componentes.
        </p>
      </div>
    </main>
  );
}
