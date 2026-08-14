import React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
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

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  leadingIcon,
  trailingIcon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 leading-none whitespace-nowrap font-bold",
        "transition-opacity duration-200",
        "hover:opacity-80 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:opacity-45",
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
    </button>
  );
}
