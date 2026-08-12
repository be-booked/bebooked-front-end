import { Resend } from "resend";

/**
 * Default sender. The domain must be verified in Resend or delivery fails
 * silently for every recipient except the account owner.
 */
export const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "BeBooked <hello@bebookedtoday.com>";

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  from?: string;
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
  from = FROM_DEFAULT,
}: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set — skipping send:", subject);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
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
