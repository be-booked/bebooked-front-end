import React from "react";
import { cn } from "@/lib/cn";

type IconButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";
type IconButtonShape = "square" | "round";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  label: string; // required for a11y
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-[34px]",
  md: "size-[42px]",
  lg: "size-[50px]",
};

const variantClasses: Record<IconButtonVariant, string> = {
  primary:   "bg-near-black text-warm-cream border-regular border-near-black",
  accent:    "bg-sage text-warm-cream border-regular border-sage",
  secondary: "bg-transparent text-near-black border-regular border-stone",
  ghost:     "bg-transparent text-near-black border-regular border-transparent",
};

export function IconButton({
  children,
  variant = "secondary",
  size = "md",
  shape = "square",
  disabled = false,
  label,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center",
        "transition-opacity duration-200",
        "hover:opacity-80 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:opacity-45",
        shape === "round" ? "rounded-full" : "",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
