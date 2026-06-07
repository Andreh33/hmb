// Builds a WhatsApp order deep-link (wa.me) from cart lines. Per §10.
// Enhanced: optional pickup/schedule window + per-line notes, backward compatible.

export interface WhatsAppItem {
  name: string;
  qty: number;
  price: number; // cents
  /** Optional free-text note attached to the line (e.g. "sin cebolla"). */
  note?: string;
}

export interface WhatsAppOrderOptions {
  /** Free-text kitchen note for the whole order. */
  notes?: string;
  /** Preferred time slot label, e.g. "Hoy 21:30" or "Para recoger 14:00". */
  schedule?: string;
  /** Localised label for the schedule line. Defaults to ES. */
  scheduleLabel?: string;
  /** Localised label for the notes line. Defaults to ES. */
  notesLabel?: string;
  /** Localised greeting prefix. Defaults to ES. */
  greeting?: (brand: string) => string;
  /** Localised total label. Defaults to "Total". */
  totalLabel?: string;
}

const DEFAULT_OPTS: Required<
  Pick<WhatsAppOrderOptions, "scheduleLabel" | "notesLabel" | "totalLabel">
> & { greeting: (brand: string) => string } = {
  scheduleLabel: "Hora",
  notesLabel: "Notas",
  totalLabel: "Total",
  greeting: (brand) => `¡Hola ${brand}! Quiero pedir:`,
};

function formatLine(i: WhatsAppItem): string {
  const base = `• ${i.qty}× ${i.name} — ${((i.price * i.qty) / 100).toFixed(2)}€`;
  const trimmed = i.note?.trim();
  return trimmed ? `${base}\n   ↳ ${trimmed}` : base;
}

/**
 * Backward-compatible signature: existing callers pass
 * (phone, items, brand, notes?). New callers may pass an options object as the
 * 4th argument to attach a schedule window, per-line notes and localised labels.
 */
export function buildWhatsAppOrder(
  phoneE164: string,
  items: WhatsAppItem[],
  brand: string,
  notesOrOptions?: string | WhatsAppOrderOptions,
): string {
  const opts: WhatsAppOrderOptions =
    typeof notesOrOptions === "string"
      ? { notes: notesOrOptions }
      : (notesOrOptions ?? {});

  const greeting = opts.greeting ?? DEFAULT_OPTS.greeting;
  const notesLabel = opts.notesLabel ?? DEFAULT_OPTS.notesLabel;
  const scheduleLabel = opts.scheduleLabel ?? DEFAULT_OPTS.scheduleLabel;
  const totalLabel = opts.totalLabel ?? DEFAULT_OPTS.totalLabel;

  const lines = items.map(formatLine);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0) / 100;

  const blocks: string[] = [
    `${greeting(brand)}\n${lines.join("\n")}`,
    `${totalLabel}: ${total.toFixed(2)}€`,
  ];

  const schedule = opts.schedule?.trim();
  if (schedule) blocks.push(`${scheduleLabel}: ${schedule}`);

  const note = opts.notes?.trim();
  if (note) blocks.push(`${notesLabel}: ${note}`);

  const text = blocks.join("\n\n");
  const phone = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds neutral time-slot suggestions from "now", in 15-min steps.
 * Pure/deterministic given the `now` argument so it is SSR-safe (callers pass a
 * stable Date on the client after mount). Returns short HH:MM labels.
 */
export function suggestTimeSlots(now: Date, count = 6, stepMin = 15): string[] {
  const slots: string[] = [];
  const base = new Date(now.getTime());
  // round up to the next step boundary, +1 step of prep lead time
  const lead = stepMin;
  base.setMinutes(
    Math.ceil((base.getMinutes() + lead) / stepMin) * stepMin,
    0,
    0,
  );
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime() + i * stepMin * 60_000);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}
