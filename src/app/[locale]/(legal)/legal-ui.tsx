// Presentational helpers shared by the legal pages (server components).
// Keep the prose readable and on-token without depending on a typography
// plugin: spacing + muted color via CSS vars.
import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl tracking-tight sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-muted)] [&_a]:text-[var(--color-accent)] [&_a]:underline [&_a]:underline-offset-2 [&_li]:marker:text-[var(--color-accent)] [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function LegalUpdated({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <p className="mt-3 text-xs uppercase tracking-wide text-[var(--color-muted)]/70">
      {label}: {placeholder}
    </p>
  );
}
