// Builds a WhatsApp order deep-link (wa.me) from cart lines. Per §10.

export function buildWhatsAppOrder(
  phoneE164: string,
  items: { name: string; qty: number; price: number }[],
  brand: string,
  notes?: string,
): string {
  const lines = items.map(
    (i) => `• ${i.qty}× ${i.name} — ${(i.price / 100).toFixed(2)}€`,
  );
  const total = items.reduce((s, i) => s + i.qty * i.price, 0) / 100;
  const note = notes ? `\n\nNotas: ${notes}` : "";
  const text = `¡Hola ${brand}! Quiero pedir:\n${lines.join("\n")}\n\nTotal: ${total.toFixed(2)}€${note}`;
  const phone = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
