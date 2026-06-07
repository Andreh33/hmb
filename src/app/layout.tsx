import "./globals.css";

// Root passthrough layout. The real <html>/<body> shell lives in
// app/[locale]/layout.tsx so it can set lang from the active locale (next-intl).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
