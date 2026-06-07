# DECISIONS — SEAR

Una línea por decisión.

- 2026-06-07 · Aislamiento por ruta (un árbol, ramas lógicas) en vez de 24 git-worktrees físicos: propiedad de archivos disjunta (§4) → sin merge a 24 bandas, build único coherente.
- 2026-06-07 · Hero base en DOM/canvas (frames 2D, parallax CSS, still) en vez de WebGL obligatorio: corre nativo en Safari/iPhone; WebGL es realce por experiencia (§16).
- 2026-06-07 · Clash Display + Satoshi aliasadas a Bricolage/Geist hasta self-host por A-SMASH (Fontshare). Sin system fonts.
- 2026-06-07 · Datos mock neutros (mock.ts) detrás de useMenu/useSiteConfig; A-DATA cablea Supabase tras la misma interfaz. Cero reseñas/cifras inventadas (§0.7).
- 2026-06-07 · `prefers-reduced-motion` NO implementado (decisión explícita del doc §16).
- 2026-06-07 · noUncheckedIndexedAccess activado (§3); el código WebGL/partículas lo respeta con guardas/`?? 0`.
- 2026-06-07 · Footer (sections.tsx): enlaces legales pasan de `<a href="/es/...">` hardcoded a `<Link>` de `@/i18n/navigation` con paths sin prefijo de locale (next-intl añade el locale activo). Arregla routing por idioma y el lint `no-html-link-for-pages`.
- 2026-06-07 · prime/index.tsx: `acts` pasa de `useRef(buildPrimeActs())` a `useMemo` (acts estáticos) → evita acceso a ref en render (regla React Compiler) sin cambiar comportamiento.
- 2026-06-07 · LayeredParallax: `layers` envuelto en `useMemo([manifest.layers])` para estabilizar deps del RAF-effect (exhaustive-deps).
- 2026-06-07 · CookieBanner/Cart/Capability/ProbadorClient: `eslint-disable react-hooks/set-state-in-effect` acotado en sincronizaciones mount-time de estado solo-cliente (localStorage/Date/querystring/capabilities), hidratación-seguras e intencionadas.
