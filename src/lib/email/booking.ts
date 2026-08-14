import { safeSend } from "./client";
import {
  emailLayout,
  formatSlotForEmail,
  detailRow,
  card,
  p,
  esc,
} from "./layout";
import { formatPrice, formatAddress, formatPhone } from "@/lib/format";
import { APP_URL } from "@/lib/url";

export interface BookingEmailData {
  serviceName: string;
  durationMins: number;
  priceCents: number;
  slotDate: string; // UTC "YYYY-MM-DD"
  slotTime: string; // UTC "HH:MM"
  shortCode: string;
  cancellationPolicy: string | null;

  proName: string;
  proEmail: string | null;
  proStudio: string | null;
  proPhone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;

  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
}

/**
 * Confirmation to the client who just booked.
 * Reply-to is the pro so a reply reaches the person they're seeing.
 */
export async function sendBookingConfirmation(d: BookingEmailData): Promise<boolean> {
  if (!d.clientEmail) return false;

  const when = formatSlotForEmail(d.slotDate, d.slotTime);
  const address = formatAddress(
    d.addressStreet,
    d.addressCity,
    d.addressState,
    d.addressZip,
  );
  const proLine = [d.proName, d.proStudio].filter(Boolean).join(" · ");

  const phoneDisplay = formatPhone(d.proPhone);
  const phoneDigits = d.proPhone?.replace(/\D/g, "") ?? "";

  const details = card(
    [
      detailRow("Service", `${d.serviceName} · ${d.durationMins} min`),
      detailRow("When", when),
      detailRow("With", proLine),
      address
        ? detailRow(
            "Where",
            address,
            `https://maps.google.com/?q=${encodeURIComponent(address)}`,
          )
        : "",
      phoneDisplay
        ? detailRow("Contact", phoneDisplay, `tel:+1${phoneDigits}`)
        : "",
      detailRow("Price", formatPrice(d.priceCents)),
    ].join(""),
  );

  // Reply-to routes to the pro, so "reply to this email" reaches them without
  // printing their Clerk login address in the body.
  const reachOut = phoneDisplay
    ? `Need to make a change? Call or text ${esc(phoneDisplay)}, or just reply to this email.`
    : `Need to make a change? Just reply to this email.`;

  const html = emailLayout({
    preheader: `${d.serviceName} with ${d.proName} — ${when}`,
    eyebrow: "Booking confirmed",
    headline: "You're booked.",
    body:
      p(`Hi ${esc(d.clientName.split(" ")[0])} — your appointment with ${esc(d.proName)} is confirmed.`) +
      details,
    cta: { label: "View your booking", url: `${APP_URL}/b/${d.shortCode}/confirmed` },
    footnote: d.cancellationPolicy
      ? `<strong>Cancellation policy:</strong> ${esc(d.cancellationPolicy)}<br><br>${reachOut}`
      : reachOut,
  });

  const text = [
    `You're booked.`,
    ``,
    `Hi ${d.clientName.split(" ")[0]} — your appointment with ${d.proName} is confirmed.`,
    ``,
    `Service: ${d.serviceName} (${d.durationMins} min)`,
    `When: ${when}`,
    `With: ${proLine}`,
    address ? `Where: ${address}` : "",
    phoneDisplay ? `Contact: ${phoneDisplay}` : "",
    `Price: ${formatPrice(d.priceCents)}`,
    ``,
    d.cancellationPolicy ? `Cancellation policy: ${d.cancellationPolicy}` : "",
    phoneDisplay
      ? `Need to make a change? Call or text ${phoneDisplay}, or reply to this email.`
      : `Need to make a change? Just reply to this email.`,
    ``,
    `View your booking: ${APP_URL}/b/${d.shortCode}/confirmed`,
  ]
    .filter(Boolean)
    .join("\n");

  return safeSend({
    to: d.clientEmail,
    subject: `Booked: ${d.serviceName} with ${d.proName}`,
    html,
    text,
    replyTo: d.proEmail ?? undefined,
  });
}

/**
 * Alert to the pro that one of their open slots just filled .
 * Reply-to is the client so the pro can reach them in one tap.
 */
export async function sendNewBookingAlert(d: BookingEmailData): Promise<boolean> {
  if (!d.proEmail) return false;

  const when = formatSlotForEmail(d.slotDate, d.slotTime);

  const details = card(
    [
      detailRow("Service", `${d.serviceName} · ${d.durationMins} min`),
      detailRow("When", when),
      detailRow("Client", d.clientName),
      detailRow(
        "Phone",
        formatPhone(d.clientPhone) || d.clientPhone,
        `tel:+1${d.clientPhone.replace(/\D/g, "")}`,
      ),
      d.clientEmail
        ? detailRow("Email", d.clientEmail, `mailto:${d.clientEmail}`)
        : "",
      detailRow("Price", formatPrice(d.priceCents)),
    ].join(""),
  );

  const html = emailLayout({
    preheader: `${d.clientName} · ${formatPhone(d.clientPhone) || d.clientPhone} · ${when}`,
    eyebrow: "Slot filled",
    headline: `${d.serviceName} just got booked.`,
    body:
      p(`${esc(d.clientName)} grabbed your ${esc(when)} opening.`) + details,
    cta: { label: "Open dashboard", url: `${APP_URL}/dashboard` },
    footnote: "Reply to this email to reach the client directly.",
  });

  const text = [
    `${d.serviceName} just got booked.`,
    ``,
    `${d.clientName} grabbed your ${when} opening.`,
    ``,
    `Service: ${d.serviceName} (${d.durationMins} min)`,
    `When: ${when}`,
    `Client: ${d.clientName}`,
    `Phone: ${formatPhone(d.clientPhone) || d.clientPhone}`,
    d.clientEmail ? `Email: ${d.clientEmail}` : "",
    `Price: ${formatPrice(d.priceCents)}`,
    ``,
    `Dashboard: ${APP_URL}/dashboard`,
  ]
    .filter(Boolean)
    .join("\n");

  return safeSend({
    to: d.proEmail,
    subject: `Booked: ${d.serviceName} — ${when}`,
    html,
    text,
    replyTo: d.clientEmail ?? undefined,
  });
}
