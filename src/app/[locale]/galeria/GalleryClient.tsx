"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExperienceToggle } from "@/experiences/ExperienceToggle";
import {
  Accordion,
  BadgeChip,
  BeforeAfterSlider,
  ConfettiToast,
  DrawBorderButton,
  Duotone,
  FlipCard,
  GiantSectionTitle,
  KenBurns,
  KineticMarquee,
  LiquidButton,
  MagneticButton,
  MarqueeImageStrip,
  MenuItemCard,
  Modal,
  MoltenDivider,
  NumberRoll,
  OutlineToFill,
  OverlayMenu,
  ParallaxDepthCard,
  PillToggle,
  RevealCard,
  ScrambleText,
  ScrollProgress,
  Skeleton,
  SkeletonText,
  SoundToggle,
  SparkButton,
  SpotlightCard,
  TiltGlareCard,
  Tooltip,
  VariableMorphText,
  useConfettiToast,
} from "@/shared/ui";

// Kitchen-sink gallery. Every component from §9, each re-styled live by the
// ExperienceToggle (switch experience = entire palette/type/motion changes).

function Demo({
  title,
  span = false,
  children,
}: {
  title: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-[var(--radius)] border border-[var(--color-muted)]/15 bg-[var(--color-surface)] p-6 ${span ? "sm:col-span-2 lg:col-span-3" : ""}`}
    >
      <p className="mb-4 text-xs uppercase tracking-widest text-[var(--color-muted)]">
        {title}
      </p>
      <div className="flex min-h-28 flex-1 items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function GalleryClient() {
  const t = useTranslations("gallery");
  const toast = useConfettiToast();
  const [modal, setModal] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [pill, setPill] = useState<"diario" | "fin">("diario");

  return (
    <main className="min-h-screen px-5 py-28">
      <ScrollProgress className="fixed inset-x-0 top-0 z-[60]" />

      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl md:text-7xl">{t("title")}</h1>
            <p className="mt-2 text-[var(--color-muted)]">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <SoundToggle />
            <ExperienceToggle />
          </div>
        </header>

        {/* Hero type showcase */}
        <section className="mb-14">
          <GiantSectionTitle kicker="Galería viva" as="h2">
            Cada pieza, cinco mundos
          </GiantSectionTitle>
          <div className="mt-6 text-6xl md:text-8xl">
            <OutlineToFill text="SEAR" trigger="scroll" />
          </div>
        </section>

        <MoltenDivider className="mb-12" height={40} />

        {/* Kinetic marquee band */}
        <section className="mb-12">
          <KineticMarquee className="border-y border-[var(--color-muted)]/15 py-4 font-display text-3xl uppercase">
            Smash · Sear · Stack · Serve
          </KineticMarquee>
        </section>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* ----- Buttons ----- */}
          <Demo title="MagneticButton">
            <MagneticButton onClick={() => toast.fire("¡Pedido recibido!")}>
              Pedir ahora
            </MagneticButton>
          </Demo>
          <Demo title="LiquidButton">
            <LiquidButton>Reservar mesa</LiquidButton>
          </Demo>
          <Demo title="SparkButton">
            <SparkButton onClick={() => toast.fire("Añadido a la orden")}>
              Añadir +
            </SparkButton>
          </Demo>
          <Demo title="DrawBorderButton">
            <DrawBorderButton>Ver carta</DrawBorderButton>
          </Demo>
          <Demo title="PillToggle">
            <PillToggle
              value={pill}
              onChange={setPill}
              options={[
                { value: "diario", label: "Diario" },
                { value: "fin", label: "Findes" },
              ]}
            />
          </Demo>
          <Demo title="BadgeChip">
            <div className="flex flex-wrap gap-2">
              <BadgeChip>Nuevo</BadgeChip>
              <BadgeChip tone="muted">Veggie</BadgeChip>
              <BadgeChip tone="outline">Gluten</BadgeChip>
            </div>
          </Demo>

          {/* ----- Cards ----- */}
          <Demo title="TiltGlareCard">
            <TiltGlareCard className="w-full">
              <div className="p-8 text-center font-display text-3xl">14.50€</div>
            </TiltGlareCard>
          </Demo>
          <Demo title="SpotlightCard">
            <SpotlightCard className="w-full">
              <div className="p-8 text-center">
                <p className="font-display text-2xl">Doble Smash</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Mueve el cursor
                </p>
              </div>
            </SpotlightCard>
          </Demo>
          <Demo title="ParallaxDepthCard">
            <ParallaxDepthCard
              className="aspect-[4/3] w-full"
              layers={[
                {
                  depth: -0.4,
                  className: "absolute inset-0",
                  content: (
                    <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_120%,var(--color-accent),var(--color-surface))]" />
                  ),
                },
                {
                  depth: 0.8,
                  className:
                    "absolute inset-0 flex items-center justify-center",
                  content: (
                    <span className="font-display text-4xl text-[var(--color-bg)] mix-blend-overlay">
                      PRIME
                    </span>
                  ),
                },
              ]}
            />
          </Demo>
          <Demo title="RevealCard">
            <RevealCard className="w-full">
              <div className="p-8 text-center font-display text-2xl">
                Revelado al scroll
              </div>
            </RevealCard>
          </Demo>
          <Demo title="FlipCard">
            <div className="h-36 w-full">
              <FlipCard
                front={<span className="font-display text-2xl">Frente</span>}
                back={
                  <span className="font-display text-2xl text-[var(--color-accent)]">
                    Reverso
                  </span>
                }
              />
            </div>
          </Demo>
          <Demo title="MenuItemCard" span>
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MenuItemCard
                name="Ember Royale"
                desc="Vacuno madurado, cheddar curado, cebolla caramelizada al carbón."
                price="13.90€"
                badges={["Nuevo"]}
                onAdd={() => toast.fire("Ember Royale añadida")}
              />
              <MenuItemCard
                name="Smash Doble"
                desc="Doble smash, salsa de la casa, pepinillos, pan brioche."
                price="11.50€"
                badges={["Picante"]}
                onAdd={() => toast.fire("Smash Doble añadida")}
              />
              <MenuItemCard
                name="Verde Vivo"
                desc="Hamburguesa de remolacha y garbanzo, alioli de hierbas."
                price="10.90€"
                badges={["Veggie"]}
                onAdd={() => toast.fire("Verde Vivo añadida")}
              />
            </div>
          </Demo>

          {/* ----- Type & kinetics ----- */}
          <Demo title="ScrambleText">
            <span className="font-display text-3xl">
              <ScrambleText text="SABOR REAL" />
            </span>
          </Demo>
          <Demo title="VariableMorphText">
            <VariableMorphText text="HOVER ME" className="text-4xl" />
          </Demo>
          <Demo title="NumberRoll">
            <span className="font-display text-5xl text-[var(--color-accent)]">
              <NumberRoll value={14.5} decimals={2} suffix="€" />
            </span>
          </Demo>

          {/* ----- Media ----- */}
          <Demo title="Duotone">
            <Duotone
              src=""
              alt="Demo duotone"
              className="aspect-[4/3] w-full"
              revealOnHover
            />
          </Demo>
          <Demo title="KenBurns">
            <KenBurns src="" alt="Demo KenBurns" className="aspect-[4/3] w-full">
              <span className="font-display text-2xl">Atmósfera</span>
            </KenBurns>
          </Demo>
          <Demo title="BeforeAfterSlider">
            <BeforeAfterSlider
              before=""
              after=""
              className="aspect-[4/3] w-full"
            />
          </Demo>
          <Demo title="MarqueeImageStrip" span>
            <MarqueeImageStrip
              className="w-full"
              height={120}
              images={Array.from({ length: 6 }, (_, i) => ({
                src: "",
                alt: `Tile ${i}`,
              }))}
            />
          </Demo>

          {/* ----- Feedback & overlays ----- */}
          <Demo title="Tooltip">
            <Tooltip label="Contiene gluten y lácteos">
              <span className="cursor-help rounded-[var(--radius)] border border-[var(--color-muted)]/30 px-4 py-2 text-sm">
                Alérgenos
              </span>
            </Tooltip>
          </Demo>
          <Demo title="Modal">
            <DrawBorderButton onClick={() => setModal(true)}>
              Abrir modal
            </DrawBorderButton>
          </Demo>
          <Demo title="OverlayMenu">
            <DrawBorderButton onClick={() => setOverlay(true)}>
              Abrir menú
            </DrawBorderButton>
          </Demo>
          <Demo title="ConfettiToast">
            <SparkButton onClick={() => toast.fire("¡Hecho!")}>
              Lanzar toast
            </SparkButton>
          </Demo>
          <Demo title="Skeleton">
            <div className="w-full space-y-3">
              <Skeleton className="h-24 w-full" />
              <SkeletonText lines={3} />
            </div>
          </Demo>
          <Demo title="ScrollProgress (ring)">
            <ScrollProgress variant="ring" />
          </Demo>

          {/* ----- Accordion ----- */}
          <Demo title="Accordion" span>
            <Accordion
              className="w-full"
              items={[
                {
                  id: "horario",
                  title: "Horario",
                  content: "Abierto de 12:00 a 23:30 todos los días.",
                },
                {
                  id: "reservas",
                  title: "Reservas",
                  content: "Acepta reservas para grupos de más de 6 personas.",
                },
                {
                  id: "alergenos",
                  title: "Alérgenos",
                  content:
                    "Consulta la carta de alérgenos completa en el local o por WhatsApp.",
                },
              ]}
            />
          </Demo>
        </div>

        <p className="mt-12 text-sm text-[var(--color-muted)]">
          Galería hyper-premium — pulsa 1–5 o usa el toggle para reestilar cada
          pieza en vivo.
        </p>
      </div>

      {/* Mounted overlays */}
      <ConfettiToast
        open={toast.open}
        message={toast.message}
        onDismiss={toast.dismiss}
      />
      <Modal open={modal} onClose={() => setModal(false)} title="Tu pedido">
        <p className="text-[var(--color-muted)]">
          Este es un diálogo accesible con foco atrapado y cierre con Escape.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <DrawBorderButton onClick={() => setModal(false)}>
            Cerrar
          </DrawBorderButton>
          <MagneticButton onClick={() => setModal(false)}>
            Confirmar
          </MagneticButton>
        </div>
      </Modal>
      <OverlayMenu
        open={overlay}
        onClose={() => setOverlay(false)}
        links={[
          { label: "Carta", href: "#carta" },
          { label: "Historia", href: "#historia" },
          { label: "Ubicación", href: "#ubicacion" },
          { label: "Reservar", href: "#reservar" },
        ]}
        footer={<span>Pulsa Escape para cerrar</span>}
      />
    </main>
  );
}
