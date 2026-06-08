import React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "outline" | "soft" | "solid";
type BadgeTone = "neutral" | "sage" | "success" | "danger" | "onDark";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
}

// Per-tone classes: [fg, border, soft-bg]
const toneMap: Record<BadgeTone, { fg: string; border: string; softBg: string; solidBg: string }> = {
  neutral: { fg: "text-near-black", border: "border-stone",   softBg: "bg-warm-linen",   solidBg: "bg-stone" },
  sage:    { fg: "text-sage-deep",  border: "border-sage",    softBg: "bg-sage-soft",    solidBg: "bg-sage" },
  success: { fg: "text-success",    border: "border-success", softBg: "bg-success-soft", solidBg: "bg-success" },
  danger:  { fg: "text-danger",     border: "border-danger",  softBg: "bg-danger-soft",  solidBg: "bg-danger" },
  onDark:  { fg: "text-stone",      border: "border-stone/20",softBg: "bg-transparent",  solidBg: "bg-stone" },
};

export function Badge({
  children,
  variant = "outline",
  tone = "neutral",
  className,
  ...rest
}: BadgeProps) {
  const t = toneMap[tone];

  const variantClasses: Record<BadgeVariant, string> = {
    outline: cn("bg-transparent border", t.fg, t.border),
    soft:    cn(t.softBg,  "border border-transparent", t.fg),
    solid:   cn(t.solidBg, "border border-transparent text-warm-cream"),
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px]",
        "text-[11px] font-normal tracking-[0.06em] uppercase leading-none",
        "py-[5px] px-[9px]",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
