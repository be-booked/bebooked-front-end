import { Card } from "@/components/ui";
import type React from "react";

interface ServiceListItemProps {
  name: string;
  subtitle: string;
  actions: React.ReactNode;
}

/**
 * Shared service row: ✂️ icon + name + subtitle + actions slot.
 * Used in setup/page.tsx and account/ServicesSection.tsx.
 */
export function ServiceListItem({ name, subtitle, actions }: ServiceListItemProps) {
  return (
    <Card variant="linen" padding="0" className="flex items-center gap-3 px-4 py-[14px]">
      <div
        className="size-8 rounded-[8px] bg-stone flex items-center justify-center shrink-0 text-sm"
        aria-hidden="true"
      >
        ✂️
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-near-black mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </div>
        <div className="text-xs text-muted">{subtitle}</div>
      </div>
      <div className="flex gap-1 shrink-0">{actions}</div>
    </Card>
  );
}
