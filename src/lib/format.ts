// ── Shared formatting helpers ─────────────────────────────────────────────

export function formatSlotWhen(slotDate: string, slotTime: string): string {
  const [year, month, day] = slotDate.split("-").map(Number);
  const [hour, minute] = slotTime.split(":").map(Number);

  const d = new Date(year, month - 1, day);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const dayStr = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const ap = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeStr = `${h12}:${String(minute).padStart(2, "0")} ${ap}`;

  return `${dayStr} · ${timeStr}`;
}

/** "123 Main St, Charlotte, NC 28202" — omits empty parts */
export function formatAddress(
  street?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
): string {
  const line2 = [city, state && zip ? `${state} ${zip}` : (state ?? zip)].filter(Boolean).join(", ");
  return [street, line2].filter(Boolean).join(", ");
}

/** "Charlotte, NC" — for compact display in headers */
export function formatCityState(city?: string | null, state?: string | null): string {
  return [city, state].filter(Boolean).join(", ");
}

export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
