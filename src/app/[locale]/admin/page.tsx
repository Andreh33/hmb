import { setRequestLocale } from "next-intl/server";
import { getCategories, getAllMenuItems, getSiteConfig } from "@/shared/data/queries";
import { AdminDashboard } from "./AdminDashboard";

// Admin home. Data is fetched server-side (Supabase with mock fallback) and
// handed to the client dashboard, which calls the server actions to mutate.
// The layout already guards auth/env, so reaching here means a live session.

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, items, siteConfig] = await Promise.all([
    getCategories(),
    getAllMenuItems(),
    getSiteConfig(),
  ]);

  return (
    <AdminDashboard
      initialCategories={categories}
      initialItems={items}
      initialSiteConfig={siteConfig}
    />
  );
}
