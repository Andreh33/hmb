"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// RUTA 66 — 2D physics ingredient drop. matter.js drops stylized burger
// ingredients (buns, patties, cheese, lettuce, tomato, sesame) into a bowl.
// Click/tap or the "soltar" button drops more; drag to toss them around.
// Mounted only when in view (IntersectionObserver) and never on the server.

interface IngredientSpec {
  kind: "bunTop" | "bunBottom" | "patty" | "cheese" | "lettuce" | "tomato" | "sesame";
  fill: string;
  stroke: string;
  w: number;
  h: number;
  round: number;
}

// Palette pulled from the diner tokens so it stays on-brand if they retune.
const SPECS: IngredientSpec[] = [
  { kind: "patty", fill: "#5A3320", stroke: "#3A2014", w: 110, h: 30, round: 15 },
  { kind: "cheese", fill: "var(--accent2)", stroke: "#B07E1F", w: 124, h: 16, round: 4 },
  { kind: "lettuce", fill: "#7FA63E", stroke: "#5E7E2A", w: 132, h: 18, round: 12 },
  { kind: "tomato", fill: "var(--accent)", stroke: "#8E241C", w: 90, h: 22, round: 11 },
  { kind: "bunBottom", fill: "#D89A4E", stroke: "#A9762F", w: 120, h: 26, round: 12 },
  { kind: "bunTop", fill: "#E2A95B", stroke: "#A9762F", w: 122, h: 40, round: 22 },
];

export function IngredientDrop({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<(() => void) | null>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  // Mount the sim only once the section scrolls near the viewport.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active || reduce) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Dynamic import keeps matter.js out of the initial chunk.
    import("matter-js").then((Matter) => {
      if (disposed) return;
      const {
        Engine,
        Render,
        Runner,
        Composite,
        Bodies,
        Body,
        Mouse,
        MouseConstraint,
        Common,
      } = Matter;

      const rect = wrap.getBoundingClientRect();
      const W = Math.max(280, rect.width);
      const H = Math.max(260, rect.height);

      const engine = Engine.create();
      engine.gravity.y = 1.05;

      const render = Render.create({
        canvas,
        engine,
        options: {
          width: W,
          height: H,
          background: "transparent",
          wireframes: false,
          pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        },
      });

      // Bowl: floor + slanted walls so the stack settles centered.
      const wallOpts = { isStatic: true, render: { visible: false } };
      const floor = Bodies.rectangle(W / 2, H + 26, W * 1.4, 60, wallOpts);
      const leftWall = Bodies.rectangle(-30, H / 2, 60, H * 2, {
        ...wallOpts,
        angle: 0.12,
      });
      const rightWall = Bodies.rectangle(W + 30, H / 2, 60, H * 2, {
        ...wallOpts,
        angle: -0.12,
      });
      Composite.add(engine.world, [floor, leftWall, rightWall]);

      const resolveColor = (c: string) =>
        c.startsWith("var(")
          ? getComputedStyle(document.documentElement)
              .getPropertyValue(c.slice(4, -1))
              .trim() || "#C2362B"
          : c;

      let order = 0;
      const dropOne = (specOverride?: IngredientSpec) => {
        const spec = specOverride ?? SPECS[order % SPECS.length]!;
        order += 1;
        const x = W / 2 + Common.random(-W * 0.12, W * 0.12);
        const fill = resolveColor(spec.fill);
        const stroke = resolveColor(spec.stroke);

        const common = {
          restitution: 0.18,
          friction: 0.6,
          density: 0.0014,
          chamfer: { radius: spec.round },
          render: { fillStyle: fill, strokeStyle: stroke, lineWidth: 2 },
        } as const;

        let body: Matter.Body;
        if (spec.kind === "sesame") {
          body = Bodies.circle(x, -40, 4, {
            ...common,
            render: { fillStyle: "#F3E2B3", strokeStyle: "#D8C285", lineWidth: 1 },
          });
        } else {
          body = Bodies.rectangle(x, -40, spec.w, spec.h, common);
        }
        Body.setAngularVelocity(body, Common.random(-0.06, 0.06));
        Body.rotate(body, Common.random(-0.2, 0.2));
        Composite.add(engine.world, body);

        // Sesame flurry when the top bun lands — playful detail.
        if (spec.kind === "bunTop") {
          for (let i = 0; i < 5; i++) {
            const seed = Bodies.circle(
              x + Common.random(-30, 30),
              -70 - i * 14,
              3.4,
              {
                restitution: 0.3,
                friction: 0.4,
                density: 0.0008,
                render: {
                  fillStyle: "#F3E2B3",
                  strokeStyle: "#D8C285",
                  lineWidth: 1,
                },
              },
            );
            Composite.add(engine.world, seed);
          }
        }

        // Keep the world from growing unbounded.
        const bodies = Composite.allBodies(engine.world).filter(
          (b) => !b.isStatic,
        );
        if (bodies.length > 46) {
          const oldest = bodies[0];
          if (oldest) Composite.remove(engine.world, oldest);
        }
      };

      dropRef.current = () => dropOne();

      // Seed an opening stack so the section never looks empty.
      [...SPECS].reverse().forEach((s, i) => {
        window.setTimeout(() => !disposed && dropOne(s), 140 + i * 220);
      });

      // Drag-to-toss.
      const mouse = Mouse.create(canvas);
      const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.18, render: { visible: false } },
      });
      Composite.add(engine.world, mc);
      // Don't swallow page scroll over the canvas.
      const mouseAny = mouse as unknown as {
        element: HTMLElement;
        mousewheel: EventListener;
      };
      mouseAny.element.removeEventListener("wheel", mouseAny.mousewheel);

      const runner = Runner.create();
      Runner.run(runner, engine);
      Render.run(render);
      setReady(true);

      // Keep canvas matched to layout.
      const ro = new ResizeObserver(() => {
        const r = wrap.getBoundingClientRect();
        const nw = Math.max(280, r.width);
        const nh = Math.max(260, r.height);
        render.canvas.width = nw * (render.options.pixelRatio as number);
        render.canvas.height = nh * (render.options.pixelRatio as number);
        render.options.width = nw;
        render.options.height = nh;
        Render.setPixelRatio(render, render.options.pixelRatio as number);
        Body.setPosition(floor, Matter.Vector.create(nw / 2, nh + 26));
        Body.setPosition(rightWall, Matter.Vector.create(nw + 30, nh / 2));
      });
      ro.observe(wrap);

      cleanup = () => {
        ro.disconnect();
        Render.stop(render);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        render.canvas.width = 0;
        render.canvas.height = 0;
        dropRef.current = null;
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [active, reduce]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1)",
          touchAction: "pan-y",
          cursor: "grab",
        }}
      />
      {reduce ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-[var(--color-muted)]">
          Físicas pausadas (preferencia de movimiento reducido)
        </div>
      ) : (
        <button
          type="button"
          onClick={() => dropRef.current?.()}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--color-text)] bg-[var(--color-surface)] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text)] shadow-[3px_3px_0_var(--color-text)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:translate-x-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          + Soltar ingrediente
        </button>
      )}
    </div>
  );
}
