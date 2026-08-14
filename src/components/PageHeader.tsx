import { cn } from "@/lib/cn";
import type React from "react";

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared page header shell.
 * Provides: bg-warm-cream, bottom border, horizontal padding, vertical padding, flex row.
 * Pass className to override layout (e.g. "justify-between", "gap-4", "justify-center").
 */
export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "bg-warm-cream border-b border-hairline px-6 py-[14px] flex items-center",
        className,
      )}
    >
      {children}
    </header>
  );
}
