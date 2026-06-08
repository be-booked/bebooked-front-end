import React from "react";
import { cn } from "@/lib/cn";

type WordmarkSize = "xs" | "sm" | "md" | "lg" | "xl";
type WordmarkTone = "dark" | "light";

interface WordmarkProps extends React.HTMLAttributes<HTMLElement> {
  size?: WordmarkSize;
  tone?: WordmarkTone;
  as?: React.ElementType;
}

const sizeMap: Record<WordmarkSize, string> = {
  xs: "14px",
  sm: "22px",
  md: "32px",
  lg: "56px",
  xl: "80px",
};

const toneClass: Record<WordmarkTone, string> = {
  dark:  "text-near-black",
  light: "text-warm-cream",
};

export default function Wordmark({
  size = "md",
  tone = "dark",
  as: Tag = "span",
  className,
  style,
  ...rest
}: WordmarkProps) {
  return (
    <Tag
      className={cn(
        "tracking-[-0.02em] whitespace-nowrap inline-block leading-none",
        toneClass[tone],
        className,
      )}
      style={{ fontSize: sizeMap[size], ...style }}
      {...rest}
    >
      <span className="font-bold">Be</span>
      <span className="font-light">Booked</span>
    </Tag>
  );
}
