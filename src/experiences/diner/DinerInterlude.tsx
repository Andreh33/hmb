"use client";

import dynamic from "next/dynamic";
import { GiantSectionTitle } from "@/shared/ui/GiantSectionTitle";
import { KineticMarquee, Reveal } from "@/shared/motion/primitives";
import { Jukebox } from "./Jukebox";
import { OrderWheel } from "./OrderWheel";

// Matter.js sim — browser-only, lazy so its chunk never blocks first paint.
const IngredientDrop = dynamic(
  () => import("./IngredientDrop").then((m) => m.IngredientDrop),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
        Calentando la plancha…
      </div>
    ),
  },
);

function RouteSign({ children }: { children: string }) {
  return (
    <span className="mx-6 inline-flex items-center gap-3 font-display text-2xl uppercase tracking-tight text-[var(--color-text)] sm:text-4xl">
      <span
        aria-hidden
        className="inline-grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--color-text)] text-[10px] font-bold sm:h-9 sm:w-9 sm:text-xs"
      >
        66
      </span>
      {children}
    </span>
  );
}

export function DinerInterlude() {
  return (
    <section
      id="cocina"
      data-act="kitchen"
      className="relative overflow-hidden border-y border-[var(--color-text)]/15 bg-[var(--color-surface)] py-20 md:py-28"
    >
      {/* Kinetic route-sign banner — sets the road-trip rhythm. */}
      <KineticMarquee
        className="border-b border-[var(--color-text)]/12 pb-6"
        speed={48}
        velocityFactor={0.5}
        gap={0}
      >
        <RouteSign>Pan caliente</RouteSign>
        <RouteSign>Carne a la plancha</RouteSign>
        <RouteSign>Batidos espesos</RouteSign>
        <RouteSign>Sin prisa</RouteSign>
      </KineticMarquee>

      <div className="mx-auto mt-14 grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        {/* Physics drop */}
        <div className="order-2 lg:order-1">
          <GiantSectionTitle kicker="Móntala tú" as="h2">
            Apila tu burger
          </GiantSectionTitle>
          <Reveal delay={0.08} className="mt-4 max-w-md text-[var(--color-muted)]">
            <p>
              Físicas de verdad: suelta ingredientes y míralos caer, rebotar y
              apilarse. Arrástralos para recolocarlos.
            </p>
          </Reveal>
          <div
            className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)] border-2 border-[var(--color-text)] bg-[var(--color-bg)] shadow-[6px_6px_0_var(--color-text)]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-text) 6%, transparent) 0 1px, transparent 1px 28px)",
            }}
          >
            <IngredientDrop className="absolute inset-0" />
          </div>
        </div>

        {/* Wheel + jukebox */}
        <div className="order-1 flex flex-col gap-12 lg:order-2">
          <div>
            <GiantSectionTitle kicker="¿Qué pido?" as="h2">
              Gira la ruleta
            </GiantSectionTitle>
            <div className="mt-8">
              <OrderWheel />
            </div>
          </div>
          <Reveal
            delay={0.05}
            className="rounded-[var(--radius)] border-2 border-[var(--color-text)] bg-[var(--color-bg)] p-6 shadow-[6px_6px_0_var(--color-text)]"
          >
            <Jukebox />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
