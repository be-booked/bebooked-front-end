import React from "react";
import { cn } from "@/lib/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[] | string[];
  children?: React.ReactNode;
}

export function Select({ label, hint, error, id, options, children, className, style, ...rest }: SelectProps) {
  const selId = id ?? (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className={cn("flex flex-col gap-[7px]", className)} style={style}>
      {label && (
        <label
          htmlFor={selId}
          className="text-[11px] font-medium tracking-[0.12em] uppercase text-warm-gray"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative border transition-colors duration-200",
          error ? "border-danger" : "border-stone focus-within:border-near-black",
        )}
      >
        <select
          id={selId}
          className="appearance-none w-full border-none outline-none bg-transparent text-base font-normal text-near-black py-[13px] pl-[14px] pr-10 cursor-pointer"
          {...rest}
        >
          {options
            ? options.map((o) => {
                const value = typeof o === "object" ? o.value : o;
                const text  = typeof o === "object" ? o.label : o;
                return <option key={value} value={value}>{text}</option>;
              })
            : children}
        </select>
        <span
          aria-hidden="true"
          className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-warm-gray flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
      {(hint || error) && (
        <span className={cn("text-xs", error ? "text-danger" : "text-muted")}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
