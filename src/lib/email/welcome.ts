import { safeSend, REPLY_TO_HUMAN, UNSUBSCRIBE_EMAIL } from "./client";
import { emailLayout, checkList, highlight, p, esc } from "./layout";
import { APP_URL, APP_HOST } from "@/lib/url";

const INSTAGRAM_URL = "https://www.instagram.com/bebookedtoday/";

/** Same four perks promised on the landing page — keep them in sync. */
const FOUNDING_PERKS = [
  "Three months free",
  "Founding price locked in as we grow",
  "Direct input on what we build next",
  "First in line for everything we ship",
];

/**
 * Sent when someone joins the founding-member waitlist.
 *
 * Sends under the BeBooked name for inbox consistency but replies route to a
 * real person — the whole point is starting a conversation, and replies also
 * build sender reputation ahead of any bulk campaign.
 */
export async function sendWaitlistWelcome(
  name: string,
  email: string,
): Promise<boolean> {
  const firstName = name.trim().split(" ")[0] || name;

  const html = emailLayout({
    preheader:
      "Three months free, founding price locked in — plus one quick question.",
    eyebrow: "Founding member",
    headline: "You're on the list.",
    body:
      p(
        `Hi ${esc(firstName)} — thanks for signing up. You're in Charlotte's founding group, which means you help shape what BeBooked becomes before it opens up.`,
      ) +
      p(`<strong>What you get:</strong>`) +
      checkList(FOUNDING_PERKS) +
      p(
        `We'll reach out before we open access in Charlotte. In the meantime, one question — <strong>what are you using to book clients today?</strong> Hit reply and tell me. It genuinely shapes what we build next.`,
      ) +
      p(`— Devan`),
    cta: { label: "Follow along on Instagram", url: INSTAGRAM_URL },
    footnote: `You're getting this because you joined the BeBooked founding list. <a href="mailto:${esc(UNSUBSCRIBE_EMAIL)}?subject=unsubscribe" style="color:inherit;">Unsubscribe</a> and we'll take you off.`,
  });

  const text = [
    `You're on the list.`,
    ``,
    `Hi ${firstName} — thanks for signing up. You're in Charlotte's founding group, which means you help shape what BeBooked becomes before it opens up.`,
    ``,
    `What you get:`,
    ...FOUNDING_PERKS.map((perk) => `  - ${perk}`),
    ``,
    `We'll reach out before we open access in Charlotte. In the meantime, one question — what are you using to book clients today? Hit reply and tell me. It genuinely shapes what we build next.`,
    ``,
    `— Devan`,
    ``,
    `Follow along: ${INSTAGRAM_URL}`,
    ``,
    `You're getting this because you joined the BeBooked founding list. Email ${UNSUBSCRIBE_EMAIL} with "unsubscribe" and we'll take you off.`,
  ].join("\n");

  return safeSend({
    to: email,
    subject: "You're on the BeBooked founding list",
    html,
    text,
    replyTo: REPLY_TO_HUMAN,
    bulk: true,
  });
}

/**
 * Sent once a pro finishes setup and actually has a bookable page.
 *
 * Deliberately not fired at Clerk signup — before setup there's no slug and
 * no services, so "here's your link" would point at nothing.
 */
export async function sendAccountWelcome(
  name: string,
  email: string,
  slug: string,
): Promise<boolean> {
  const firstName = name.trim().split(" ")[0] || name;
  const profileUrl = `${APP_URL}/${slug}`;

  const html = emailLayout({
    preheader: `Your link is ${APP_HOST}/${slug} — share it to fill your first opening.`,
    eyebrow: "You're set up",
    headline: "Your booking page is live.",
    body:
      p(
        `Hi ${esc(firstName)} — your BeBooked page is ready. This is the link you share whenever you have a last-minute opening.`,
      ) +
      highlight("Your booking page", `${APP_HOST}/${slug}`, profileUrl) +
      p(`<strong>To fill your first slot:</strong>`) +
      checkList([
        "Post an opening — service, time, price",
        "Copy the slot link or hit Share",
        "Drop it on your story or text it to a client",
      ]) +
      p(
        `Clients book straight from the link. No app, no account — they just add their name, phone, and email, and you get an email the moment it fills.`,
      ),
    cta: { label: "Post your first slot", url: `${APP_URL}/dashboard/create` },
    footnote:
      "Stuck on something, or want a feature that isn't there yet? Reply to this email — it goes to a real person.",
  });

  const text = [
    `Your booking page is live.`,
    ``,
    `Hi ${firstName} — your BeBooked page is ready. This is the link you share whenever you have a last-minute opening.`,
    ``,
    `Your booking page: ${profileUrl}`,
    ``,
    `To fill your first slot:`,
    `  - Post an opening — service, time, price`,
    `  - Copy the slot link or hit Share`,
    `  - Drop it on your story or text it to a client`,
    ``,
    `Clients book straight from the link. No app, no account — they just add their name, phone, and email, and you get an email the moment it fills.`,
    ``,
    `Post your first slot: ${APP_URL}/dashboard/create`,
    ``,
    `Stuck on something, or want a feature that isn't there yet? Reply to this email — it goes to a real person.`,
  ].join("\n");

  return safeSend({
    to: email,
    subject: "Your BeBooked page is live",
    html,
    text,
    replyTo: REPLY_TO_HUMAN,
  });
}
