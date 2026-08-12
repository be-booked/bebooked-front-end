import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { safeSend } from "@/lib/email/client";
import { sendWaitlistWelcome } from "@/lib/email/welcome";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // RETURNING yields no row when the email was already on the list, which is
  // how we avoid re-welcoming (and re-notifying) a repeat submitter.
  let isNewSignup = false;
  try {
    const rows = await sql`
      INSERT INTO waitlist (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    isNewSignup = rows.length > 0;
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  // Best-effort — the signup is already saved, so neither send can fail the
  // request. Run together so a slow send doesn't stack on the other.
  if (isNewSignup) {
    await Promise.allSettled([
      sendWaitlistWelcome(name, email),
      safeSend({
        to: process.env.NOTIFY_EMAIL!,
        subject: `New waitlist signup: ${name}`,
        text: `${name} (${email}) joined the BeBooked waitlist.`,
        html: `<p>${name} (${email}) joined the BeBooked waitlist.</p>`,
        replyTo: email,
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
