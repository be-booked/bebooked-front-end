import { Resend } from "resend";

/** Display name every outbound email sends under. */
const FROM_NAME = "BeBooked";

/**
 * Guarantees a branded display name. EMAIL_FROM may be set to a bare address
 * (e.g. "hello@bebookedtoday.com"), which would otherwise surface in inboxes
 * as the mailbox name rather than the brand.
 */
function withDisplayName(address: string): string {
  const trimmed = address.trim();
  return trimmed.includes("<") ? trimmed : `${FROM_NAME} <${trimmed}>`;
}

/**
 * Default sender. The domain must be verified in Resend or delivery fails
 * silently for every recipient except the account owner.
 *
 * Prefer a role address (hello@, notifications@) over a personal one —
 * Gmail overrides the display name with the recipient's saved contact name,
 * so mail from devan@ shows as "devan" to anyone who has her in contacts.
 */
export const FROM_DEFAULT = withDisplayName(
  process.env.EMAIL_FROM ?? "hello@bebookedtoday.com",
);

/**
 * Where replies to relationship emails (welcomes, updates) should land —
 * a monitored human inbox, not the no-reply sender.
 */
export const REPLY_TO_HUMAN =
  process.env.EMAIL_REPLY_TO ?? "devan@bebookedtoday.com";

/**
 * Where unsubscribe requests go until there's a real one-click endpoint.
 * A mailto target is a valid List-Unsubscribe value per RFC 8058 and is
 * honest about the current process (someone reads it and removes you).
 */
export const UNSUBSCRIBE_EMAIL =
  process.env.EMAIL_UNSUBSCRIBE ?? REPLY_TO_HUMAN;

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  from?: string;
  /**
   * Marks this as bulk/relationship mail rather than transactional.
   *
   * Adds List-Unsubscribe headers, which Gmail and Outlook read as a signal
   * that the sender is legitimate rather than evading filters — a meaningful
   * deliverability win for a domain with no sending reputation yet.
   *
   * Leave false for transactional mail (booking confirmations). Those are
   * responses to a user action and shouldn't be unsubscribable.
   */
  bulk?: boolean;
}

/**
 * Sends an email and never throws.
 *
 * Every caller here runs inside a flow whose primary work has already
 * succeeded (a booking is written, a row is inserted). A mail failure must
 * not roll that back or surface an error to the user — it gets logged and
 * swallowed. Returns true on success so callers can branch if they care.
 */
export async function safeSend({
  to,
  subject,
  html,
  text,
  replyTo,
  from,
  bulk = false,
}: SendArgs): Promise<boolean> {
  const sender = from ? withDisplayName(from) : FROM_DEFAULT;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set — skipping send:", subject);
    return false;
  }

  // One-Click is only valid alongside an https target; with a mailto-only
  // list we advertise the mailto and let the client render its own UI.
  const headers = bulk
    ? {
        "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
      }
    : undefined;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
      ...(headers ? { headers } : {}),
    });

    if (error) {
      console.error("[email] Resend returned an error:", subject, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", subject, err);
    return false;
  }
}
