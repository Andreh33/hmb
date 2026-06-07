"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useSiteConfig } from "@/shared/data/useMenu";
import { Reveal } from "@/shared/motion/primitives";
import { Counter } from "../Counter";
import { ROUTE_PATH } from "../art";
import { EMBER_STATS } from "../theme";
import { onAct } from "../scroll";

/**
 * Location act (pinned). A hand-drawn route DRAWS across a dark map field as the
 * act scrubs, a pin drops at the destination, three counters tick up, and the
 * address + hours resolve. No invented figures — counters describe the craft
 * (sear temp, dry-age days, open-kitchen hours from theme constants).
 */
export function Location() {
  const locale = useLocale() as Locale;
  const site = useSiteConfig();
  const routeRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    path.style.strokeDasharray = String(total);
    path.style.strokeDashoffset = String(total);
    return onAct("location", (p) => {
      const drawn = Math.min(1, p * 1.25);
      path.style.strokeDashoffset = String(total * (1 - drawn));

      // A bright comet head rides the drawing tip until it lands on the pin.
      const head = headRef.current;
      if (head) {
        if (drawn > 0.001 && drawn < 0.995) {
          const pt = path.getPointAtLength(total * drawn);
          head.setAttribute("cx", pt.x.toFixed(2));
          head.setAttribute("cy", pt.y.toFixed(2));
          head.style.opacity = "1";
        } else {
          head.style.opacity = "0";
        }
      }

      if (pinRef.current) {
        const show = drawn > 0.92;
        pinRef.current.style.opacity = show ? "1" : "0";
        pinRef.current.style.transform = `translateY(${show ? 0 : -4}px)`;
      }
      // Arrival pulse ring expands once the pin drops.
      if (ringRef.current) {
        const land = Math.max(0, (drawn - 0.92) / 0.08);
        ringRef.current.style.transform = `scale(${(1 + land * 1.4).toFixed(3)})`;
        ringRef.current.style.opacity = String((1 - land) * 0.6);
        ringRef.current.style.transformOrigin = "94px 12px";
      }
    });
  }, []);

  return (
    <div className="relative grid h-screen w-full grid-cols-1 overflow-hidden bg-[var(--color-bg)] md:grid-cols-2">
      {/* Map field */}
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(224,153,47,0.08),transparent_60%)]" />
        {/* faint grid */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={100} stroke="var(--color-muted)" strokeOpacity={0.06} strokeWidth={0.1} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="var(--color-muted)" strokeOpacity={0.06} strokeWidth={0.1} />
          ))}
          <path
            ref={routeRef}
            d={ROUTE_PATH}
            stroke="var(--color-accent)"
            strokeWidth={0.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 1px rgba(224,153,47,0.8))" }}
          />
          {/* Comet head riding the drawing tip */}
          <circle
            ref={headRef}
            r={1.1}
            fill="#FFE08C"
            style={{
              opacity: 0,
              filter: "drop-shadow(0 0 2px rgba(255,196,90,0.9))",
            }}
          />
          {/* Expanding arrival pulse */}
          <circle
            ref={ringRef}
            cx={94}
            cy={12}
            r={4.5}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={0.3}
            style={{ opacity: 0, willChange: "transform, opacity" }}
          />
          <g ref={pinRef} style={{ opacity: 0, transition: "opacity 0.4s, transform 0.4s" }}>
            <circle cx={94} cy={12} r={2.4} fill="var(--color-accent)" />
            <circle cx={94} cy={12} r={4.5} fill="none" stroke="var(--color-accent)" strokeWidth={0.4} strokeOpacity={0.5} />
          </g>
        </svg>
      </div>

      {/* Detail column */}
      <div className="flex flex-col justify-center gap-8 px-8 py-16 md:px-16">
        <Reveal>
          <p
            className="text-xs uppercase tracking-[0.42em] text-[var(--color-accent)]"
            style={{ fontFamily: "var(--body)" }}
          >
            Encuéntranos
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p
            className="text-3xl font-semibold leading-tight text-[var(--color-text)] md:text-5xl"
            style={{ fontFamily: "var(--display)" }}
          >
            {site.address}
          </p>
        </Reveal>

        <div className="grid grid-cols-3 gap-4 border-y border-[var(--color-muted)]/15 py-6">
          {EMBER_STATS.map((s) => (
            <div key={s.id}>
              <Counter
                to={s.to}
                suffix={s.suffix}
                className="block text-3xl font-semibold text-[var(--color-accent)] md:text-4xl"
              />
              <span
                className="mt-1 block text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-muted)]"
                style={{ fontFamily: "var(--body)" }}
              >
                {s.label[locale]}
              </span>
            </div>
          ))}
        </div>

        <Reveal delay={0.1}>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            {Object.entries(site.hours).map(([day, hrs]) => (
              <li key={day} className="flex justify-between gap-6 text-sm">
                <span className="uppercase tracking-[0.1em]">{day}</span>
                <span className="tabular-nums text-[var(--color-text)]">{hrs}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
