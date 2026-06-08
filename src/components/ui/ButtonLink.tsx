import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LinkProps } from "next/link";
import type React from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-[9px] text-[13px] tracking-[0.06em]",
  md: "px-6 py-[13px] text-[15px] tracking-[0.04em]",
  lg: "px-8 py-[17px] text-base tracking-[0.04em]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-near-black text-warm-cream border-regular border-near-black",
  accent:    "bg-sage text-warm-cream border-regular border-sage",
  secondary: "bg-transparent text-near-black border-regular border-stone",
  ghost:     "bg-transparent text-near-black border-regular border-transparent",
};

export function ButtonLink({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 leading-none whitespace-nowrap font-bold no-underline",
        "transition-opacity duration-200 hover:opacity-80",
        fullWidth && "w-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
