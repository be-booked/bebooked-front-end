"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import { Avatar } from "@/components/ui";
import { AccountSheet } from "./AccountSheet";

interface AppBarProps {
  name: string;
  slug: string;
  photoUrl: string | null;
}

/**
 * Sticky dashboard header: wordmark + avatar trigger for the account menu.
 * Replaces the old bottom tab bar — the sheet scales to more destinations
 * than two tabs could, and matches the public profile's back-to-dashboard link.
 *
 * Hidden on flows that supply their own header (onboarding, slot creation).
 */
export function AppBar({ name, slug, photoUrl }: AppBarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (
    pathname.startsWith("/dashboard/setup") ||
    pathname.startsWith("/dashboard/create")
  ) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-warm-cream border-b border-hairline">
        {/* Wordmark doubles as the route home, per web convention */}
        <Link href="/dashboard" aria-label="Go to my slots" className="flex items-center">
          <Wordmark size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Account menu"
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center justify-center size-11 -mr-2.5 bg-transparent border-none p-0 cursor-pointer"
        >
          <Avatar name={name} src={photoUrl ?? undefined} size={34} />
        </button>
      </header>

      {open && (
        <AccountSheet
          name={name}
          slug={slug}
          photoUrl={photoUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
