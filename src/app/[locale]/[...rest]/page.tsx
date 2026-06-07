import { notFound } from "next/navigation";

// Catch-all so any unmatched path under a locale triggers the localized
// not-found (src/app/[locale]/not-found.tsx) instead of Next's default 404.
// Required with next-intl App Router routing.
export default function CatchAllPage() {
  notFound();
}
