"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  categoryToRow,
  menuItemToRow,
  siteConfigToRow,
} from "@/lib/supabase/types";
import type { Category, MenuItem, SiteConfig } from "@/shared/data/types";

// Server actions for the admin. All writes go through the auth'd Supabase
// client; RLS enforces that only authenticated users can mutate. Every action
// short-circuits with a friendly message when Supabase is not configured.

export type ActionResult = { ok: boolean; message: string };

const NO_ENV: ActionResult = {
  ok: false,
  message: "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
};

// --- Auth -------------------------------------------------------------------

export async function sendMagicLink(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Introduce un email." };

  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    (hdrs.get("host") ? `https://${hdrs.get("host")}` : "");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: origin ? `${origin}/admin/auth/callback` : undefined,
    },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Revisa tu correo: te enviamos un enlace de acceso." };
}

export async function signOut(): Promise<void> {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/admin");
}

// --- Categories -------------------------------------------------------------

export async function upsertCategory(category: Category): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const row = categoryToRow(category);
  const { error } = await supabase.from("categories").upsert(row);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Categoría guardada." };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Categoría eliminada." };
}

// --- Menu items -------------------------------------------------------------

export async function upsertMenuItem(item: MenuItem): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const row = menuItemToRow(item);
  const { error } = await supabase.from("menu_items").upsert(row);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Plato guardado." };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Plato eliminado." };
}

// --- Site config ------------------------------------------------------------

export async function saveSiteConfig(config: SiteConfig): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return NO_ENV;

  const row = siteConfigToRow(config);
  const { error } = await supabase.from("site_config").upsert(row);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Configuración guardada." };
}
