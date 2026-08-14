import React from "react";
import { cn } from "@/lib/cn";

type EyebrowTone = "default" | "muted" | "accent" | "onDark";

interface EyebrowLabelProps extends React.HTMLAttributes<HTMLElement> {
  tone?: EyebrowTone;
  as?: React.ElementType;
}

const toneClasses: Record<EyebrowTone, string> = {
  default: "text-near-black",
  muted:   "text-muted",
  accent:  "text-sage",
  onDark:  "text-stone",
};

export function EyebrowLabel({
  children,
  tone = "default",
  as: Tag = "span",
  className,
  ...rest
}: EyebrowLabelProps) {
  return (
    <Tag
      className={cn(
        "text-xs font-normal tracking-[0.12em] uppercase inline-block",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
