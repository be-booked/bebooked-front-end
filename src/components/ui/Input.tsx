import React from "react";
import { cn } from "@/lib/cn";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export function Input({ label, hint, error, id, type = "text", prefix, className, style, ...rest }: InputProps) {
  const inputId = id ?? (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className={cn("flex flex-col gap-[7px]", className)} style={style}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium tracking-[0.12em] uppercase text-warm-gray"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2 px-[14px] border transition-colors duration-200",
          error ? "border-danger" : "border-stone focus-within:border-near-black",
        )}
      >
        {prefix && (
          <span className="text-muted text-[15px] flex shrink-0">{prefix}</span>
        )}
        <input
          id={inputId}
          type={type}
          className="flex-1 border-none outline-none bg-transparent text-base font-normal text-near-black py-[13px] w-full"
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span className={cn("text-xs", error ? "text-danger" : "text-muted")}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
