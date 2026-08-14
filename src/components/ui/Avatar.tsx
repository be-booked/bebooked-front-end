import React from "react";
import { cn } from "@/lib/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  size?: number;
}

export function Avatar({ src, name = "", size = 48, className, style, ...rest }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden",
        "bg-warm-linen border border-stone text-warm-gray font-medium tracking-[0.02em] shrink-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        ...style,
      }}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials || "·"
      )}
    </span>
  );
}
