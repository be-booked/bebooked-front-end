"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/dashboard",         icon: CalendarDays, label: "Slots"   },
  { href: "/dashboard/account", icon: User,         label: "Account" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-warm-cream border-t border-hairline"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch max-w-[480px] mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-[5px] py-3 no-underline transition-colors duration-150",
                active ? "text-near-black" : "text-stone hover:text-warm-gray"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
              <span className={cn(
                "text-[10px] tracking-[0.04em] font-semibold uppercase",
                active ? "text-near-black" : "text-stone"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
