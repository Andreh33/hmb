"use client";

/**
 * SMASH — local experience stylesheet. Self-hosts Clash Display + Satoshi from
 * /public/fonts (downloaded from Fontshare) and re-points --font-clash /
 * --font-satoshi for THIS experience scope only ([data-exp="smash"]). It never
 * touches the root globals.css; the @font-face + scoped overrides win simply by
 * being more specific and loaded later. Also declares the brutalist utility
 * vocabulary (hard grid, neon glow, bleed, glitch) used across the sections.
 */
export function SmashStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
/* --- Self-hosted Fontshare faces --- */
@font-face{font-family:"Clash Display Local";src:url("/fonts/clash-display-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Clash Display Local";src:url("/fonts/clash-display-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Clash Display Local";src:url("/fonts/clash-display-600.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"Clash Display Local";src:url("/fonts/clash-display-700.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:"Satoshi Local";src:url("/fonts/satoshi-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Satoshi Local";src:url("/fonts/satoshi-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Satoshi Local";src:url("/fonts/satoshi-700.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}

/* Re-wire the experience font tokens to the self-hosted faces, scoped to SMASH
   so other experiences keep their Google fallbacks. */
:root[data-exp="smash"]{
  --font-clash:"Clash Display Local","Bricolage Grotesque",system-ui,sans-serif;
  --font-satoshi:"Satoshi Local",system-ui,sans-serif;
  --smash-line: color-mix(in srgb, var(--color-text) 14%, transparent);
  --smash-line-strong: color-mix(in srgb, var(--color-text) 32%, transparent);
}

/* The experience root carries its own type + selection so nothing leaks. */
.smash-root{
  font-family:var(--font-satoshi);
  background:var(--color-bg);
  color:var(--color-text);
  --grid: 96px;
  /* shared motion vocabulary mirrored as CSS easings (snap = smash default) */
  --ease-snap: cubic-bezier(0.85,0,0.15,1);
  --ease-lux: cubic-bezier(0.16,1,0.3,1);
  /* optical type defaults: tighten tracking, enable kerning + contextual alts */
  text-rendering:optimizeLegibility;
  font-feature-settings:"kern" 1,"ss01" 1,"cv01" 1;
  -webkit-font-smoothing:antialiased;
}
.smash-root ::selection{background:var(--color-accent2);color:#0b0b0d;text-shadow:none}
.smash-display{
  font-family:var(--font-clash);
  font-weight:700;
  letter-spacing:-0.03em;
  line-height:0.82;
  font-feature-settings:"kern" 1,"ss01" 1;
}
/* Optical tightening that scales with size — big type wants tighter tracking. */
.smash-display.smash-tight{letter-spacing:-0.045em}

/* Hard brutalist grid that stays visible. */
.smash-grid-lines{
  background-image:
    linear-gradient(to right, var(--smash-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--smash-line) 1px, transparent 1px);
  background-size: var(--grid) var(--grid);
}

/* Neon edge glow keyed off the experience glow token. Three-stop bloom (tight
   core -> mid halo -> wide atmospheric wash) reads like a real gas tube. */
.smash-neon{
  text-shadow:
    0 0 calc(2px * var(--glow)) color-mix(in srgb, var(--color-accent) 95%, white),
    0 0 calc(9px * var(--glow)) color-mix(in srgb, var(--color-accent) 90%, transparent),
    0 0 calc(28px * var(--glow)) color-mix(in srgb, var(--color-accent) 60%, transparent),
    0 0 calc(60px * var(--glow)) color-mix(in srgb, var(--color-accent) 30%, transparent);
}
.smash-neon-2{
  text-shadow:
    0 0 calc(2px * var(--glow)) color-mix(in srgb, var(--color-accent2) 95%, white),
    0 0 calc(9px * var(--glow)) color-mix(in srgb, var(--color-accent2) 90%, transparent),
    0 0 calc(28px * var(--glow)) color-mix(in srgb, var(--color-accent2) 55%, transparent),
    0 0 calc(60px * var(--glow)) color-mix(in srgb, var(--color-accent2) 28%, transparent);
}
/* Slow ~CRT flicker so the neon feels alive, not a static shadow. */
.smash-neon-live{animation:smash-neon-flicker 7s steps(1) infinite}
.smash-box-neon{
  box-shadow:
    0 0 0 2px var(--color-text),
    6px 6px 0 0 var(--color-accent2),
    0 0 calc(14px * var(--glow)) color-mix(in srgb, var(--color-accent) 70%, transparent),
    0 0 calc(48px * var(--glow)) color-mix(in srgb, var(--color-accent) 30%, transparent);
  transition:box-shadow 0.4s var(--ease-lux), transform 0.4s var(--ease-lux);
}
@keyframes smash-neon-flicker{
  0%,100%{opacity:1}
  92%{opacity:1}
  93%{opacity:0.72}
  94%{opacity:1}
  96%{opacity:0.85}
  97%{opacity:1}
}

/* Scroll-driven neon ignition. --lit (0..1) is written per-frame by NeonText:
   color fades muted->accent and the gas-tube glow grows; .is-flicker adds the
   live CRT flicker once fully lit. */
.smash-neon-reveal{
  --lit:0;
  /* Unlit = clean, legible near-white tint (crisp); lit = full accent neon. */
  color:color-mix(in srgb, color-mix(in srgb, var(--color-text) 78%, var(--color-muted)), var(--color-accent) calc(var(--lit) * 100%));
  opacity:calc(0.78 + 0.22 * var(--lit));
  text-shadow:
    0 0 calc(8px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent) 92%, white),
    0 0 calc(24px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent) 55%, transparent),
    0 0 calc(54px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent) 28%, transparent);
  transition:opacity 0.12s linear;
  will-change:color, text-shadow, opacity;
}
.smash-neon-reveal.tone2{
  color:color-mix(in srgb, color-mix(in srgb, var(--color-text) 78%, var(--color-muted)), var(--color-accent2) calc(var(--lit) * 100%));
  text-shadow:
    0 0 calc(7px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent2) 92%, white),
    0 0 calc(22px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent2) 55%, transparent),
    0 0 calc(50px * var(--lit) * var(--glow)) color-mix(in srgb, var(--color-accent2) 28%, transparent);
}
.smash-neon-reveal.is-flicker{animation:smash-neon-flicker 7s steps(1) infinite}

/* Nav link: neon underline wipes in from the left on hover. */
.smash-navlink{position:relative;transition:color 0.25s var(--ease-snap)}
.smash-navlink::after{
  content:"";position:absolute;left:0;bottom:-4px;height:2px;width:100%;
  background:var(--color-accent);
  box-shadow:0 0 calc(10px*var(--glow)) var(--color-accent);
  transform:scaleX(0);transform-origin:left;
  transition:transform 0.35s var(--ease-lux);
}
.smash-navlink:hover{color:var(--color-accent)}
.smash-navlink:hover::after{transform:scaleX(1)}

/* Giant bleeding outline type. */
.smash-bleed{
  color:transparent;
  -webkit-text-stroke: clamp(1px, 0.18vw, 3px) var(--color-text);
}

/* Hover-glitch: doubled RGB-split pseudo elements on hover. */
.smash-glitch{position:relative;display:inline-block}
.smash-glitch::before,.smash-glitch::after{
  content:attr(data-text);position:absolute;inset:0;
  clip-path:inset(0 0 0 0);opacity:0;pointer-events:none;
}
.smash-glitch::before{color:var(--color-accent);mix-blend-mode:screen}
.smash-glitch::after{color:var(--color-accent2);mix-blend-mode:screen}
.smash-glitch:hover::before{opacity:0.92;transform:translate(-2px,-1px);animation:smash-gl-a 0.32s steps(2) infinite}
.smash-glitch:hover::after{opacity:0.92;transform:translate(2px,1px);animation:smash-gl-b 0.32s steps(2) infinite}
@keyframes smash-gl-a{0%{clip-path:inset(0 0 70% 0)}50%{clip-path:inset(60% 0 10% 0)}100%{clip-path:inset(10% 0 60% 0)}}
@keyframes smash-gl-b{0%{clip-path:inset(70% 0 0 0)}50%{clip-path:inset(10% 0 60% 0)}100%{clip-path:inset(60% 0 10% 0)}}

/* RGB-split flicker over the hero photo. */
@keyframes smash-rgb{
  0%,100%{transform:translate(0,0)}
  20%{transform:translate(-3px,1px)}
  40%{transform:translate(2px,-2px)}
  60%{transform:translate(-1px,2px)}
  80%{transform:translate(3px,-1px)}
}

/* Stamp impact flash. */
@keyframes smash-flash{0%{opacity:0}8%{opacity:0.9}100%{opacity:0}}

/* Hero burger entrance: slams down from slightly larger + brighter into place. */
.smash-hero-in{animation:smash-hero-in 0.85s cubic-bezier(0.16,1,0.3,1) both}
@keyframes smash-hero-in{
  0%{transform:scale(1.16);opacity:0;filter:brightness(1.5) contrast(1.1)}
  60%{opacity:1}
  100%{transform:scale(1.04);opacity:1;filter:brightness(1) contrast(1)}
}

/* Marquee equalizer-ish blink for the ticker separators. */
@keyframes smash-blink{0%,49%{opacity:1}50%,100%{opacity:0.25}}

/* Scroll-hint tick that grows + drops to invite scroll. */
@keyframes smash-scrollpulse{
  0%{transform:scaleY(0.2);transform-origin:top;opacity:0.3}
  50%{transform:scaleY(1);transform-origin:top;opacity:1}
  51%{transform-origin:bottom}
  100%{transform:scaleY(0.2);transform-origin:bottom;opacity:0.3}
}

/* --- Atmosphere planes (see sections/Atmosphere.tsx) --- */
/* Volumetric neon wash sitting behind content. */
.smash-atmos-wash{
  position:absolute;inset:-20vh -10vw;
  background:
    radial-gradient(40vmax 40vmax at 18% 22%, color-mix(in srgb, var(--color-accent) 28%, transparent) 0%, transparent 60%),
    radial-gradient(46vmax 46vmax at 84% 72%, color-mix(in srgb, var(--color-accent2) 20%, transparent) 0%, transparent 62%),
    radial-gradient(50vmax 50vmax at 60% 8%, color-mix(in srgb, var(--color-glaze) 12%, transparent) 0%, transparent 60%);
  filter:blur(10px);
  mix-blend-mode:screen;
  animation:smash-breathe 14s ease-in-out infinite;
}
@keyframes smash-breathe{
  0%,100%{opacity:0.85;transform:scale(1)}
  50%{opacity:1;transform:scale(1.06)}
}
/* CRT scanlines. */
.smash-atmos-scan{
  position:absolute;inset:0;
  background:repeating-linear-gradient(to bottom,
    rgba(255,255,255,0.035) 0px,
    rgba(255,255,255,0.035) 1px,
    transparent 1px,
    transparent 3px);
  mix-blend-mode:overlay;opacity:0.5;
}
/* Animated film grain via SVG turbulence (data-uri, no asset). */
.smash-atmos-grain{
  position:absolute;inset:-50%;
  width:200%;height:200%;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity:0.08;mix-blend-mode:overlay;
  animation:smash-grain 0.6s steps(4) infinite;
}
@keyframes smash-grain{
  0%{transform:translate(0,0)}
  25%{transform:translate(-3%,2%)}
  50%{transform:translate(2%,-3%)}
  75%{transform:translate(-2%,-2%)}
  100%{transform:translate(3%,2%)}
}
/* Center-hold vignette. */
.smash-atmos-vignette{
  position:absolute;inset:0;
  background:radial-gradient(120% 110% at 50% 42%, transparent 52%, rgba(0,0,0,0.55) 100%);
  mix-blend-mode:multiply;
}

/* ===== Feature FX (4,5,6,9,10,13,47) ===== */

/* (13) Screen-shake on add-to-cart. */
.smash-root.is-shake{animation:smash-screenshake 0.4s cubic-bezier(.36,.07,.19,.97)}
@keyframes smash-screenshake{
  10%{transform:translate(-5px,3px) rotate(-0.4deg)}
  25%{transform:translate(7px,-4px) rotate(0.5deg)}
  40%{transform:translate(-6px,5px)}
  55%{transform:translate(5px,-3px) rotate(-0.3deg)}
  70%{transform:translate(-4px,2px)}
  85%{transform:translate(3px,-2px)}
  100%{transform:translate(0,0)}
}

/* (9) Aggressive RGB-split + jitter when a section scrolls in. */
/* No transform here on purpose — GSAP owns section transforms; we only flash
   RGB-split (filter) + clip tears so the two never fight. */
.smash-fx-glitch{animation:smash-section-glitch 0.5s steps(2,end)}
@keyframes smash-section-glitch{
  0%{filter:none;clip-path:none}
  14%{filter:drop-shadow(7px 0 0 var(--color-accent)) drop-shadow(-7px 0 0 var(--color-accent2));clip-path:inset(0 0 62% 0)}
  30%{filter:drop-shadow(-6px 0 0 var(--color-accent)) drop-shadow(6px 0 0 var(--color-accent2));clip-path:inset(40% 0 18% 0)}
  46%{filter:drop-shadow(5px 0 0 var(--color-accent2));clip-path:inset(70% 0 0 0)}
  62%{filter:none;clip-path:none}
  100%{filter:none;clip-path:none}
}

/* (10) VHS tear + scanline sweep overlay on section change. */
.smash-vhs{position:fixed;inset:0;z-index:90;pointer-events:none;opacity:0}
.smash-vhs.run{animation:smash-vhs-run 0.6s ease-out}
.smash-vhs::before{ /* sweeping bright scanline band */
  content:"";position:absolute;left:0;right:0;height:14vh;
  background:linear-gradient(to bottom,
    transparent,
    color-mix(in srgb, var(--color-accent) 22%, transparent) 40%,
    rgba(255,255,255,0.18) 50%,
    color-mix(in srgb, var(--color-accent2) 22%, transparent) 60%,
    transparent);
  mix-blend-mode:screen;
  animation:smash-vhs-band 0.6s ease-out;
}
.smash-vhs::after{ /* fine CRT lines + tracking noise */
  content:"";position:absolute;inset:0;
  background:repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px);
  mix-blend-mode:overlay;
}
@keyframes smash-vhs-run{0%{opacity:1}100%{opacity:0}}
@keyframes smash-vhs-band{0%{top:-16vh}100%{top:104vh}}

/* (6) Ketchup drip falling from the hero title on load. */
.smash-drip{position:absolute;top:100%;width:6px;border-radius:0 0 6px 6px;
  background:linear-gradient(to bottom, var(--color-accent), color-mix(in srgb,var(--color-accent) 70%, #600));
  box-shadow:0 0 calc(10px*var(--glow)) color-mix(in srgb,var(--color-accent) 70%,transparent);
  transform-origin:top;transform:scaleY(0);
  animation:smash-drip-fall 1.4s cubic-bezier(.5,.05,.5,1) forwards;
}
.smash-drip::after{content:"";position:absolute;left:50%;bottom:-5px;width:11px;height:11px;
  border-radius:50%;background:inherit;transform:translateX(-50%);
  box-shadow:0 0 calc(10px*var(--glow)) color-mix(in srgb,var(--color-accent) 70%,transparent);}
@keyframes smash-drip-fall{
  0%{transform:scaleY(0)}
  70%{transform:scaleY(1)}
  100%{transform:scaleY(0.96)}
}

/* (4) Vapor / smoke rising off the burger. */
.smash-vapor{position:absolute;inset:0;pointer-events:none;overflow:hidden;mix-blend-mode:screen}
.smash-vapor i{position:absolute;bottom:32%;display:block;width:34%;height:34%;border-radius:50%;
  background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5), rgba(255,255,255,0) 65%);
  filter:blur(14px);opacity:0;
  animation:smash-vapor-rise var(--dur,7s) ease-in infinite;animation-delay:var(--d,0s);}
@keyframes smash-vapor-rise{
  0%{transform:translate(0,0) scale(0.6);opacity:0}
  18%{opacity:0.5}
  100%{transform:translate(var(--dx,0),-130%) scale(1.5);opacity:0}
}

/* (5) Heat-shimmer displacement over the grill region. */
.smash-heat{position:absolute;inset:0;pointer-events:none;
  background-size:cover;background-position:center 60%;
  -webkit-mask-image:linear-gradient(to top, #000 0%, #000 18%, transparent 46%);
          mask-image:linear-gradient(to top, #000 0%, #000 18%, transparent 46%);
  filter:url(#smash-heat-filter);opacity:0.6;}

/* (47) Preloader. */
.smash-preloader{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;
  align-items:center;justify-content:center;background:var(--color-bg);}
.smash-preloader.lift{animation:smash-preload-lift 0.7s cubic-bezier(.85,0,.15,1) forwards}
@keyframes smash-preload-lift{0%{transform:translateY(0)}100%{transform:translateY(-100%)}}
@keyframes smash-preload-stamp{
  0%{transform:scale(2.4);opacity:0;filter:blur(6px)}
  60%{opacity:1}
  100%{transform:scale(1);opacity:1;filter:blur(0)}
}

`,
      }}
    />
  );
}
