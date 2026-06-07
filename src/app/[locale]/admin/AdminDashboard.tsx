"use client";

import { useState, useTransition } from "react";
import type { Category, MenuItem, SiteConfig } from "@/shared/data/types";
import type { ExperienceId } from "@/experiences/registry";
import {
  deleteCategory,
  deleteMenuItem,
  saveSiteConfig,
  upsertCategory,
  upsertMenuItem,
  type ActionResult,
} from "./actions";

// Simple, dependency-free CRUD panel over categories / menu_items / site_config.
// Forms keep local state and dispatch server actions; results surface inline.

const EXPERIENCES: ExperienceId[] = ["smash"];

const card =
  "rounded-[var(--radius,12px)] border border-white/10 p-5";
const cardStyle = { background: "var(--color-surface, #141414)" } as const;
const input =
  "w-full rounded-[var(--radius,8px)] border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent,#e25822)]";
const btn =
  "rounded-[var(--radius,8px)] bg-[var(--color-accent,#e25822)] px-3 py-1.5 text-sm font-medium text-black transition disabled:opacity-50";
const btnGhost =
  "rounded-[var(--radius,8px)] border border-white/15 px-3 py-1.5 text-sm transition hover:bg-white/5";

function emptyCategory(sort: number): Category {
  return { id: "", slug: "", name: { es: "", en: "" }, sort };
}

function emptyItem(categoryId: string, sort: number): MenuItem {
  return {
    id: "",
    categoryId,
    name: { es: "", en: "" },
    desc: { es: "", en: "" },
    priceCents: 0,
    allergens: [],
    badges: [],
    isPublished: false,
    sort,
  };
}

export function AdminDashboard({
  initialCategories,
  initialItems,
  initialSiteConfig,
}: {
  initialCategories: Category[];
  initialItems: MenuItem[];
  initialSiteConfig: SiteConfig;
}) {
  const [msg, setMsg] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  function run(fn: () => Promise<ActionResult>) {
    start(async () => {
      const res = await fn();
      setMsg(res);
    });
  }

  return (
    <div className="space-y-12">
      {msg ? (
        <p
          className={`sticky top-0 z-10 rounded-[var(--radius,8px)] px-3 py-2 text-sm ${
            msg.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
          }`}
          role="status"
        >
          {msg.message}
        </p>
      ) : null}

      <SiteConfigSection
        initial={initialSiteConfig}
        disabled={pending}
        onSave={(c) => run(() => saveSiteConfig(c))}
      />

      <CategoriesSection
        initial={initialCategories}
        disabled={pending}
        onSave={(c) => run(() => upsertCategory(c))}
        onDelete={(id) => run(() => deleteCategory(id))}
      />

      <MenuSection
        initial={initialItems}
        categories={initialCategories}
        disabled={pending}
        onSave={(m) => run(() => upsertMenuItem(m))}
        onDelete={(id) => run(() => deleteMenuItem(id))}
      />
    </div>
  );
}

// --- Site config ------------------------------------------------------------

function SiteConfigSection({
  initial,
  disabled,
  onSave,
}: {
  initial: SiteConfig;
  disabled: boolean;
  onSave: (c: SiteConfig) => void;
}) {
  const [cfg, setCfg] = useState<SiteConfig>(initial);

  return (
    <section>
      <h2 className="mb-4 font-[var(--display)] text-xl">Configuración del sitio</h2>
      <div className={card} style={cardStyle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="opacity-70">Marca</span>
            <input
              className={input}
              value={cfg.brand}
              onChange={(e) => setCfg({ ...cfg, brand: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="opacity-70">Experiencia</span>
            <select
              className={input}
              value={cfg.experience}
              onChange={(e) =>
                setCfg({ ...cfg, experience: e.target.value as ExperienceId })
              }
            >
              {EXPERIENCES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="opacity-70">WhatsApp</span>
            <input
              className={input}
              value={cfg.whatsapp}
              onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="opacity-70">Dirección</span>
            <input
              className={input}
              value={cfg.address}
              onChange={(e) => setCfg({ ...cfg, address: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="opacity-70">Latitud</span>
            <input
              className={input}
              type="number"
              step="any"
              value={cfg.lat}
              onChange={(e) => setCfg({ ...cfg, lat: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-sm">
            <span className="opacity-70">Longitud</span>
            <input
              className={input}
              type="number"
              step="any"
              value={cfg.lng}
              onChange={(e) => setCfg({ ...cfg, lng: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className={btn}
            disabled={disabled}
            onClick={() => onSave(cfg)}
          >
            Guardar configuración
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Categories -------------------------------------------------------------

function CategoriesSection({
  initial,
  disabled,
  onSave,
  onDelete,
}: {
  initial: Category[];
  disabled: boolean;
  onSave: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Category>(emptyCategory(initial.length));

  return (
    <section>
      <h2 className="mb-4 font-[var(--display)] text-xl">Categorías</h2>
      <div className="space-y-3">
        {initial.map((c) => (
          <CategoryRow key={c.id} category={c} disabled={disabled} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>

      <div className={`mt-4 ${card}`} style={cardStyle}>
        <p className="mb-3 text-sm opacity-70">Nueva categoría</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            className={input}
            placeholder="slug"
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          />
          <input
            className={input}
            placeholder="Nombre ES"
            value={draft.name.es}
            onChange={(e) => setDraft({ ...draft, name: { ...draft.name, es: e.target.value } })}
          />
          <input
            className={input}
            placeholder="Nombre EN"
            value={draft.name.en}
            onChange={(e) => setDraft({ ...draft, name: { ...draft.name, en: e.target.value } })}
          />
          <input
            className={input}
            type="number"
            placeholder="orden"
            value={draft.sort}
            onChange={(e) => setDraft({ ...draft, sort: Number(e.target.value) || 0 })}
          />
        </div>
        <button
          type="button"
          className={`mt-3 ${btn}`}
          disabled={disabled || !draft.slug}
          onClick={() => {
            onSave(draft);
            setDraft(emptyCategory(initial.length + 1));
          }}
        >
          Añadir categoría
        </button>
      </div>
    </section>
  );
}

function CategoryRow({
  category,
  disabled,
  onSave,
  onDelete,
}: {
  category: Category;
  disabled: boolean;
  onSave: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [c, setC] = useState<Category>(category);

  return (
    <div className={`grid items-center gap-3 sm:grid-cols-[1fr_1fr_1fr_5rem_auto] ${card}`} style={cardStyle}>
      <input className={input} value={c.slug} onChange={(e) => setC({ ...c, slug: e.target.value })} />
      <input className={input} value={c.name.es} onChange={(e) => setC({ ...c, name: { ...c.name, es: e.target.value } })} />
      <input className={input} value={c.name.en} onChange={(e) => setC({ ...c, name: { ...c.name, en: e.target.value } })} />
      <input className={input} type="number" value={c.sort} onChange={(e) => setC({ ...c, sort: Number(e.target.value) || 0 })} />
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={disabled} onClick={() => onSave(c)}>
          Guardar
        </button>
        <button type="button" className={btnGhost} disabled={disabled} onClick={() => onDelete(c.id)}>
          Borrar
        </button>
      </div>
    </div>
  );
}

// --- Menu items -------------------------------------------------------------

function MenuSection({
  initial,
  categories,
  disabled,
  onSave,
  onDelete,
}: {
  initial: MenuItem[];
  categories: Category[];
  disabled: boolean;
  onSave: (m: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  const firstCat = categories[0]?.id ?? "";
  const [draft, setDraft] = useState<MenuItem>(emptyItem(firstCat, initial.length));

  return (
    <section>
      <h2 className="mb-4 font-[var(--display)] text-xl">Carta</h2>
      <div className="space-y-3">
        {initial.map((m) => (
          <MenuItemRow key={m.id} item={m} categories={categories} disabled={disabled} onSave={onSave} onDelete={onDelete} />
        ))}
      </div>

      <div className={`mt-4 ${card}`} style={cardStyle}>
        <p className="mb-3 text-sm opacity-70">Nuevo plato</p>
        <ItemFields item={draft} categories={categories} onChange={setDraft} />
        <button
          type="button"
          className={`mt-3 ${btn}`}
          disabled={disabled || !draft.name.es || !draft.categoryId}
          onClick={() => {
            onSave(draft);
            setDraft(emptyItem(firstCat, initial.length + 1));
          }}
        >
          Añadir plato
        </button>
      </div>
    </section>
  );
}

function MenuItemRow({
  item,
  categories,
  disabled,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  categories: Category[];
  disabled: boolean;
  onSave: (m: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  const [m, setM] = useState<MenuItem>(item);

  return (
    <div className={card} style={cardStyle}>
      <ItemFields item={m} categories={categories} onChange={setM} />
      <div className="mt-3 flex gap-2">
        <button type="button" className={btn} disabled={disabled} onClick={() => onSave(m)}>
          Guardar
        </button>
        <button type="button" className={btnGhost} disabled={disabled} onClick={() => onDelete(m.id)}>
          Borrar
        </button>
      </div>
    </div>
  );
}

function ItemFields({
  item,
  categories,
  onChange,
}: {
  item: MenuItem;
  categories: Category[];
  onChange: (m: MenuItem) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        <span className="opacity-70">Categoría</span>
        <select
          className={input}
          value={item.categoryId}
          onChange={(e) => onChange({ ...item, categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.es}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="opacity-70">Precio (céntimos)</span>
        <input
          className={input}
          type="number"
          value={item.priceCents}
          onChange={(e) => onChange({ ...item, priceCents: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Nombre ES</span>
        <input className={input} value={item.name.es} onChange={(e) => onChange({ ...item, name: { ...item.name, es: e.target.value } })} />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Nombre EN</span>
        <input className={input} value={item.name.en} onChange={(e) => onChange({ ...item, name: { ...item.name, en: e.target.value } })} />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Descripción ES</span>
        <input className={input} value={item.desc.es} onChange={(e) => onChange({ ...item, desc: { ...item.desc, es: e.target.value } })} />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Descripción EN</span>
        <input className={input} value={item.desc.en} onChange={(e) => onChange({ ...item, desc: { ...item.desc, en: e.target.value } })} />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Alérgenos (coma)</span>
        <input
          className={input}
          value={item.allergens.join(", ")}
          onChange={(e) =>
            onChange({ ...item, allergens: splitCsv(e.target.value) })
          }
        />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Badges (coma)</span>
        <input
          className={input}
          value={item.badges.join(", ")}
          onChange={(e) => onChange({ ...item, badges: splitCsv(e.target.value) })}
        />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Imagen (URL)</span>
        <input
          className={input}
          value={item.imageUrl ?? ""}
          onChange={(e) => onChange({ ...item, imageUrl: e.target.value || undefined })}
        />
      </label>
      <label className="text-sm">
        <span className="opacity-70">Orden</span>
        <input
          className={input}
          type="number"
          value={item.sort}
          onChange={(e) => onChange({ ...item, sort: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={item.isPublished}
          onChange={(e) => onChange({ ...item, isPublished: e.target.checked })}
        />
        <span className="opacity-70">Publicado</span>
      </label>
    </div>
  );
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
