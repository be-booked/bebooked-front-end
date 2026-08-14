import Link from "next/link";
import { Share2, Check } from "lucide-react";
import Ticker from "@/components/Ticker";
import WaitlistForm from "@/components/WaitlistForm";
import Wordmark from "@/components/Wordmark";
import { getWaitlistCount } from "@/lib/db/repositories/waitlist";

// Only surface the signup count once it's a credible number — a low count
// hurts more than no count at all.
const SOCIAL_PROOF_THRESHOLD = 10;

// Re-fetch the waitlist count hourly so it doesn't freeze at build time.
export const revalidate = 3600;

const steps = [
  {
    n: "01",
    title: "Post an opening",
    body: "Log in and create a last-minute slot in seconds — service, time, and price.",
  },
  {
    n: "02",
    title: "Share your link",
    body: "Get a unique booking link for that slot. Post it to your Instagram story, text a client, share it anywhere.",
  },
  {
    n: "03",
    title: "Get booked",
    body: "Clients book directly through your link. You confirm, and that slot is filled.",
  },
];

const clientSteps = [
  {
    title: "They tap your link",
    body: "Opens in any browser. No app to download, no account to create.",
  },
  {
    title: "Name, phone, email",
    body: "Three fields. That's the whole form.",
  },
  {
    title: "Booked",
    body: "Instant confirmation with your address and appointment details.",
  },
];

const tools = ["Vagaro", "Booksy", "Square", "GlossGenius"];

// Directional only — no dates, no commitments. These describe where the
// product is heading, not what's promised at launch.
const roadmap = [
  {
    title: "A place clients can find you",
    body: "A searchable directory of local beauty pros with real openings today. Right now your link does the work — we're building the front door.",
  },
  {
    title: "Automatic reminders",
    body: "Text and email confirmations so fewer clients forget the appointment they just grabbed.",
  },
  {
    title: "Smarter sharing",
    body: "One tap from an open slot to a story, a group text, or wherever your clients actually are.",
  },
];

/** Lucide dropped brand marks, so the Instagram glyph is inlined. */
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const foundingPerks = [
  "Three months free",
  "Founding price locked in as we grow",
  "Direct input on what we build next",
  "First in line for everything we ship",
];

export default async function Home() {
  let waitlistCount = 0;
  try {
    waitlistCount = await getWaitlistCount();
  } catch {
    // DB unavailable — page still renders, just without social proof
  }
  const showCount = waitlistCount >= SOCIAL_PROOF_THRESHOLD;

  return (
    <main>
      {/* Nav */}
      <nav className="bg-warm-cream px-8 py-6 flex items-center justify-between">
        <Wordmark size="sm" />
        <div className="flex items-center gap-6">
          <span
            className="text-xs tracking-[0.12em] uppercase text-near-black hidden sm:block"
            aria-hidden="true"
          >
            Charlotte, NC
          </span>
          <Link
            href="/sign-in"
            className="text-xs tracking-[0.12em] uppercase text-near-black no-underline border-b border-brand-stone hover:border-near-black transition-colors pb-0.5"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-near-black text-warm-cream px-8 py-24 md:py-32">
        <div className="max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.18em] uppercase text-brand-stone mb-8">
              Launching in Charlotte, NC
            </p>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] max-w-xl mb-6">
              Your calendar,
              <br />
              fully loaded.
            </h1>
            <p className="text-lg text-brand-stone max-w-md leading-relaxed mb-10">
              The fastest way to fill a last-minute opening — post a slot,
              share your link, get booked.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#waitlist"
                className="bg-accent text-warm-cream px-8 py-4 font-bold tracking-wide no-underline hover:opacity-80 transition-opacity"
              >
                Claim your founding spot
              </a>
              <a
                href="#how-it-works-heading"
                className="text-sm text-brand-stone no-underline border-b border-transparent hover:border-brand-stone transition-colors pb-0.5"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* Positioning */}
      <section
        className="bg-warm-linen px-8 py-16"
        aria-labelledby="positioning-heading"
      >
        <h2
          id="positioning-heading"
          className="text-xs tracking-[0.15em] uppercase text-near-black mb-5"
        >
          How we fit in
        </h2>
        <p className="text-2xl font-bold leading-snug text-near-black max-w-xl mb-4">
          Every empty slot is money you don&apos;t get back.
        </p>
        <p className="text-lg leading-relaxed text-near-black max-w-xl">
          Bebooked turns last-minute openings into booked appointments — post a
          slot, share your link, fill the opening in 30 seconds.
        </p>

        {/* Pricing callout */}
        <div className="border border-near-black bg-warm-cream p-6 mt-8 max-w-md">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-near-black">$25</span>
            <span className="text-sm text-warm-gray">/ month</span>
          </div>
          <p className="text-sm text-warm-gray leading-relaxed">
            Your first filled slot covers it. Everything after that is revenue
            you would have lost. Clients book free — always.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-8">
          <span className="text-xs tracking-[0.1em] uppercase text-near-black font-light mr-2">
            Works alongside →
          </span>
          {tools.map((tool) => (
            <span
              key={tool}
              className="text-xs tracking-[0.06em] uppercase text-near-black font-light px-2 py-1 border border-brand-stone"
            >
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="bg-warm-cream px-8 py-20"
        aria-labelledby="how-it-works-heading"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 md:items-center max-w-4xl">
          <div className="flex-1">
            <h2
              id="how-it-works-heading"
              className="text-xs tracking-[0.15em] uppercase text-near-black mb-10"
            >
              How it works
            </h2>
            <ol className="flex flex-col gap-9 list-none p-0 m-0">
              {steps.map(({ n, title, body }) => (
                <li key={n}>
                  <p
                    className="text-xs tracking-[0.2em] text-accent mb-3"
                    aria-hidden="true"
                  >
                    {n}
                  </p>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed max-w-sm">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Stylist dashboard mockup — mirrors the SlotCard on /dashboard. Decorative. */}
          <div
            aria-hidden="true"
            className="flex-shrink-0 w-full max-w-[380px] mx-auto md:mx-0 rounded-[28px] border-[1.5px] border-brand-stone bg-warm-linen p-5"
          >
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-warm-gray mb-3">
              My slots
            </p>

            {/* Open slot card */}
            <div className="bg-cream-raised border border-stone rounded-[12px] p-[18px] flex flex-col gap-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-base text-near-black mb-1">
                    Balayage
                  </p>
                  <p className="text-sm text-muted whitespace-nowrap">
                    Tomorrow · 11:00 AM · 120 min
                  </p>
                </div>
                <p className="font-bold text-base text-near-black shrink-0 ml-3">
                  $300
                </p>
              </div>

              {/* Copy link row */}
              <div className="flex items-center gap-2 bg-warm-linen rounded-[8px] px-[10px] py-2">
                <span className="flex-1 text-sm text-muted truncate">
                  bebookedtoday.com/b/9mnshb
                </span>
                <span className="shrink-0 bg-near-black text-warm-cream rounded-[8px] py-[5px] px-3 text-xs font-bold tracking-[0.04em]">
                  Copy
                </span>
              </div>

              {/* Share button */}
              <div className="bg-near-black py-2.5 flex items-center justify-center gap-2">
                <Share2 size={14} strokeWidth={2.5} className="text-warm-cream" />
                <span className="text-sm font-bold text-warm-cream">Share</span>
              </div>

              <p className="text-xs text-muted text-center">Delete slot</p>
            </div>
          </div>
        </div>

        {/* Mid-page CTA */}
        <div className="border-t border-brand-stone mt-16 pt-10 max-w-4xl flex flex-wrap items-center justify-between gap-6">
          <p className="text-lg text-near-black max-w-sm leading-relaxed">
            Founding members in Charlotte get 3 months free.
          </p>
          <a
            href="#waitlist"
            className="bg-near-black text-warm-cream px-8 py-4 font-bold tracking-wide no-underline hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            Join the waitlist
          </a>
        </div>
      </section>

      {/* What clients experience */}
      <section
        className="bg-warm-linen px-8 py-20"
        aria-labelledby="client-side-heading"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 md:items-start max-w-4xl">
          <div className="flex-1">
            <h2
              id="client-side-heading"
              className="text-xs tracking-[0.15em] uppercase text-near-black mb-5"
            >
              What your clients see
            </h2>
            <p className="text-2xl font-bold leading-snug text-near-black mb-10">
              No app. No account. No friction.
            </p>

            <ol className="flex flex-col gap-8 list-none p-0 m-0">
              {clientSteps.map(({ title, body }, i) => (
                <li key={title} className="flex gap-4">
                  <span
                    className="flex-shrink-0 size-7 rounded-full border border-near-black flex items-center justify-center text-xs font-bold text-near-black"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-near-black mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-warm-gray leading-relaxed">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Booking page mockup — mirrors /b/[code]. Decorative. */}
          <div
            aria-hidden="true"
            className="flex-shrink-0 w-full max-w-[380px] mx-auto md:mx-0 rounded-[28px] border-[1.5px] border-brand-stone bg-warm-cream p-5"
          >
            {/* Stylist */}
            <div className="flex items-center gap-3 mb-5">
              <div className="size-11 rounded-full bg-near-black text-warm-cream flex items-center justify-center text-sm font-bold flex-shrink-0">
                NB
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[15px] text-near-black leading-tight">
                  Nicole Bush
                </p>
                <p className="text-xs text-muted truncate">
                  My Biz · Charlotte, NC
                </p>
              </div>
            </div>

            {/* Slot detail */}
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-accent mb-2">
              Last-minute opening
            </p>
            <div className="bg-near-black rounded-[18px] p-5 mb-5 flex justify-between items-start">
              <div>
                <p className="font-bold text-base text-warm-cream mb-1.5">
                  Highlight + Cut
                </p>
                <p className="text-xs text-warm-cream/65 mb-0.5">
                  Today · 2:00 PM
                </p>
                <p className="text-xs text-warm-cream/65">120 min</p>
              </div>
              <p className="font-bold text-lg text-warm-cream flex-shrink-0">
                $220
              </p>
            </div>

            {/* Form */}
            <p className="text-sm font-bold text-near-black mb-3">
              Book this slot
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {["Your name", "Phone number", "Email"].map((label) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-medium tracking-[0.12em] uppercase text-warm-gray">
                    {label}
                  </span>
                  <div className="border border-brand-stone px-3 py-2.5 text-xs text-muted">
                    {label === "Your name"
                      ? "Maya Brooks"
                      : label === "Phone number"
                        ? "(704) 555-0118"
                        : "maya@example.com"}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-accent py-3 text-center">
              <p className="text-sm font-bold text-warm-cream tracking-wide">
                Book this slot
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where this is going — directional, deliberately no dates or promises */}
      <section
        className="bg-warm-cream px-8 py-20"
        aria-labelledby="roadmap-heading"
      >
        <div className="max-w-4xl">
          <h2
            id="roadmap-heading"
            className="text-xs tracking-[0.15em] uppercase text-near-black mb-5"
          >
            Where this is going
          </h2>
          <p className="text-2xl font-bold leading-snug text-near-black max-w-xl mb-4">
            Filling one slot is the start.
          </p>
          <p className="text-lg leading-relaxed text-warm-gray max-w-xl mb-12">
            We&apos;re building toward a version where clients come looking for
            you, not just the other way around. Here&apos;s the direction —
            shaped by what founding pros tell us they need.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {roadmap.map(({ title, body }) => (
              <div key={title} className="border-t border-brand-stone pt-5">
                <h3 className="text-base font-bold text-near-black mb-2">
                  {title}
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding member CTA */}
      <section
        id="waitlist"
        className="bg-near-black text-warm-cream px-8 py-20 scroll-mt-8"
      >
        <div className="max-w-lg">
          <p
            className="text-xs tracking-[0.15em] uppercase text-brand-stone mb-6"
            aria-hidden="true"
          >
            Founding members · Charlotte, NC
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for beauty.
            <br />
            <span className="font-light">Claim your founding spot.</span>
          </h2>
          <p className="text-brand-stone leading-relaxed mb-8">
            Charlotte&apos;s founding cohort helps shape what this becomes.
            Spots are limited.
          </p>

          <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-2.5">
            {foundingPerks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-warm-cream">
                <Check
                  size={17}
                  strokeWidth={2.5}
                  className="text-accent shrink-0 mt-1"
                  aria-hidden="true"
                />
                <span className="text-[15px] leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>

          <WaitlistForm />
          {showCount && (
            <p className="text-sm text-brand-stone mt-5 flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full bg-accent shrink-0"
                aria-hidden="true"
              />
              {waitlistCount} Charlotte pros have already joined the list.
            </p>
          )}
          <p className="text-xs text-brand-stone mt-4">
            Charlotte pros only at launch. Founding spots are limited.
          </p>

          {/* Social proof escape hatch — lets a cold visitor verify we're real */}
          <a
            href="https://www.instagram.com/bebookedtoday/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm text-brand-stone no-underline border-b border-transparent hover:border-brand-stone transition-colors pb-0.5"
          >
            <InstagramIcon />
            See what we&apos;re up to on Instagram
          </a>
        </div>
      </section>

      {/* Who we are */}
      <section className="bg-warm-linen px-8 py-16" aria-labelledby="about-heading">
        <div className="max-w-xl">
          <h2
            id="about-heading"
            className="text-xs tracking-[0.15em] uppercase text-near-black mb-5"
          >
            Who we are
          </h2>
          <p className="text-lg leading-relaxed text-near-black mb-4">
            BeBooked is built in Charlotte by two people — one taking clients,
            one writing the code. We started it because empty slots were costing
            real money and nothing on the market was built to fill them fast.
          </p>
          <p className="text-sm text-warm-gray leading-relaxed">
            BeBooked, LLC · Registered in North Carolina · Every feature so far
            has come from talking to working pros.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-cream px-8 py-8 flex justify-between items-center border-t border-brand-stone">
        <Wordmark size="sm" />
        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/bebookedtoday/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-near-black font-light tracking-[0.08em] uppercase no-underline border-b border-transparent hover:border-near-black transition-colors pb-0.5"
          >
            @bebookedtoday
          </a>
          <span className="text-xs text-near-black font-light">
            Charlotte, NC · 2026
          </span>
        </div>
      </footer>
    </main>
  );
}
