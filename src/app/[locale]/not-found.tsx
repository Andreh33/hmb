import { Link } from "@/i18n/navigation";

// (48) Brutalist SMASH 404 — neon "404", a charred-burger line, a hard CTA home.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
        textAlign: "center",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(5rem, 26vw, 20rem)",
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          color: "var(--color-accent)",
          textShadow:
            "0 0 8px color-mix(in srgb, var(--color-accent) 90%, white), 0 0 36px color-mix(in srgb, var(--color-accent) 60%, transparent), 0 0 80px color-mix(in srgb, var(--color-accent) 30%, transparent)",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Esta página se ha quemado en la plancha
      </p>
      <p style={{ color: "var(--color-muted)", maxWidth: "32ch" }}>
        No encontramos lo que buscas. Vuelve a la carta antes de que se enfríe.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: "var(--color-accent)",
          color: "var(--color-bg)",
          padding: "0.9rem 2rem",
          boxShadow: "6px 6px 0 0 var(--color-text)",
        }}
      >
        Volver al principio →
      </Link>
    </main>
  );
}
