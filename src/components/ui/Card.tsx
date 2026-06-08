import React from "react";
import { cn } from "@/lib/cn";

type CardVariant = "linen" | "raised" | "outline" | "inverse";
type CardRadius = "none" | "sm" | "md" | "lg" | "xl";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  radius?: CardRadius;
  interactive?: boolean;
  padding?: string;
}

const variantClasses: Record<CardVariant, string> = {
  linen:   "bg-warm-linen border border-transparent",
  raised:  "bg-cream-raised border border-stone shadow-card",
  outline: "bg-transparent border border-stone",
  inverse: "bg-near-black text-warm-cream border border-transparent",
};

const radiusClasses: Record<CardRadius, string> = {
  none: "",
  sm:   "rounded-[8px]",
  md:   "rounded-[12px]",
  lg:   "rounded-[22px]",
  xl:   "rounded-[32px]",
};

export function Card({
  children,
  variant = "linen",
  radius = "md",
  interactive = false,
  padding = "24px",
  className,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        radiusClasses[radius],
        variantClasses[variant],
        interactive && "cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5",
        className,
      )}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
