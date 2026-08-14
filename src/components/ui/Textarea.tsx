import React from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, rows = 4, className, style, ...rest }: TextareaProps) {
  const taId = id ?? (label ? `ta-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className={cn("flex flex-col gap-[7px]", className)} style={style}>
      {label && (
        <label
          htmlFor={taId}
          className="text-[11px] font-medium tracking-[0.12em] uppercase text-warm-gray"
        >
          {label}
        </label>
      )}
      <textarea
        id={taId}
        rows={rows}
        className={cn(
          "bg-transparent text-base font-normal text-near-black px-[14px] py-3 outline-none resize-y",
          "border transition-colors duration-200 leading-relaxed",
          error ? "border-danger focus:border-danger" : "border-stone focus:border-near-black",
        )}
        {...rest}
      />
      {(hint || error) && (
        <span className={cn("text-xs", error ? "text-danger" : "text-muted")}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
