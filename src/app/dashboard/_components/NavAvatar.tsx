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

  // Close on outside click
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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          borderRadius: "50%",
        }}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar name={name} src={src} size={size} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: size + 8,
            right: 0,
            background: "var(--warm-cream)",
            border: "1px solid var(--stone)",
            boxShadow: "var(--shadow-md)",
            minWidth: 160,
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: "10px 16px 8px",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "var(--weight-bold)",
                color: "var(--text-primary)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 140,
              }}
            >
              {name}
            </p>
          </div>

          <Link
            href="/dashboard/account"
            onClick={() => setOpen(false)}
            role="menuitem"
            style={{
              display: "block",
              padding: "12px 16px",
              fontSize: "14px",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            Account &amp; profile
          </Link>

          <button
            role="menuitem"
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              fontSize: "14px",
              color: "var(--danger)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--weight-medium)",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
