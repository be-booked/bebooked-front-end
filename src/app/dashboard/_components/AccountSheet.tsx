"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  CalendarDays,
  User,
  Share2,
  Sparkles,
  LifeBuoy,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { Avatar, IconButton } from "@/components/ui";
import { APP_HOST } from "@/lib/url";
import { cn } from "@/lib/cn";

export interface AccountSheetProps {
  name: string;
  slug: string;
  photoUrl: string | null;
  onClose: () => void;
}

const rowClass =
  "flex items-center gap-3.5 w-full min-h-[56px] px-6 py-[15px] bg-transparent " +
  "border-0 border-t border-hairline text-base font-medium text-near-black " +
  "text-left cursor-pointer no-underline transition-colors duration-[120ms] hover:bg-warm-linen";

export function AccountSheet({ name, slug, photoUrl, onClose }: AccountSheetProps) {
  const { signOut } = useClerk();
  const pathname = usePathname();

  // Lock body scroll and wire up Escape-to-close while the sheet is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const links = [
    { href: "/dashboard", icon: CalendarDays, label: "My slots" },
    { href: "/dashboard/account", icon: User, label: "Account & profile" },
    { href: `/${slug}`, icon: Share2, label: "Public profile" },
    { href: "/dashboard/account#services", icon: Sparkles, label: "Services & pricing" },
    // TODO: point at a real support destination once one exists
    { href: "mailto:hello@bebookedtoday.com", icon: LifeBuoy, label: "Help & support" },
  ] as const;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-near-black/35"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet — full-width drawer on mobile, anchored panel on desktop */}
      <div
        role="menu"
        aria-label="Account menu"
        className="fixed top-0 left-0 right-0 z-50 bg-warm-cream shadow-hover overflow-hidden
                   md:top-3 md:left-auto md:right-8 md:w-[328px] md:border md:border-stone"
      >
        {/* Bar */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-hairline">
          <Wordmark size="sm" />
          <IconButton
            label="Close menu"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="-mr-2.5"
          >
            <X size={22} />
          </IconButton>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-[13px] px-6 py-[18px]">
          <Avatar name={name} src={photoUrl ?? undefined} size={44} />
          <div className="min-w-0">
            <div className="text-[17px] font-bold text-near-black leading-tight">
              {name}
            </div>
            <div className="text-[13px] text-sage mt-[3px] truncate">
              {APP_HOST}/{slug}
            </div>
          </div>
        </div>

        {/* Navigation rows */}
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              role="menuitem"
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(rowClass, active && "bg-warm-linen")}
            >
              <span
                className={cn("shrink-0 flex", active ? "text-near-black" : "text-warm-gray")}
              >
                <Icon size={19} />
              </span>
              <span className={cn("flex-1", active && "font-bold")}>{label}</span>
              <span className="text-muted flex">
                <ChevronRight size={17} />
              </span>
            </Link>
          );
        })}

        {/* Sign out */}
        <button
          type="button"
          role="menuitem"
          onClick={() => signOut({ redirectUrl: "/" })}
          className={`${rowClass} text-danger hover:bg-danger-soft`}
        >
          <span className="shrink-0 text-danger flex">
            <LogOut size={19} />
          </span>
          <span className="flex-1">Sign out</span>
        </button>
      </div>
    </>
  );
}
