"use client";

import { useState, useRef, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar } from "@/components/ui";

interface NavAvatarProps {
  name: string;
  src?: string;
  size?: number;
}

export default function NavAvatar({ name, src, size = 34 }: NavAvatarProps) {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-transparent border-none p-0 cursor-pointer flex items-center rounded-full"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar name={name} src={src} size={size} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bg-warm-cream border border-stone shadow-[var(--shadow-md)] min-w-[160px] z-[100]"
          style={{ top: size + 8 }}
        >
          <div className="px-4 py-[10px] pb-2 border-b border-hairline">
            <p className="text-xs font-bold text-near-black m-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
              {name}
            </p>
          </div>

          <Link
            href="/dashboard/account"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-4 py-3 text-sm text-near-black no-underline border-b border-hairline"
          >
            Account &amp; profile
          </Link>

          <button
            role="menuitem"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="block w-full text-left px-4 py-3 text-sm text-danger bg-transparent border-none cursor-pointer font-medium"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
