"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export type SlotCardData = {
  id: number;
  name: string;
  when: string;
  mins: number;
  priceDisplay: string;
  shortCode: string;
};

const BASE_URL = "bebookedtoday.com";

export default function SlotCard({ slot }: { slot: SlotCardData }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);

  const bookingUrl = `${BASE_URL}/b/${slot.shortCode}`;
  const fullUrl = `https://${bookingUrl}`;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1400);
  }

  function copyForStory() {
    navigator.clipboard.writeText(fullUrl);
    setCopiedStory(true);
    setTimeout(() => setCopiedStory(false), 1400);
  }

  return (
    <Card variant="raised" radius="md" padding="18px" className="flex flex-col gap-3.5">
      {/* Name + price row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-base text-near-black mb-1">{slot.name}</div>
          <div className="text-sm text-muted flex items-center gap-[5px]">
            {slot.when} · {slot.mins} min
          </div>
        </div>
        <div className="font-bold text-base text-near-black shrink-0 ml-3">
          {slot.priceDisplay}
        </div>
      </div>

      {/* Copy link row */}
      <div className="flex items-center gap-2 bg-warm-linen rounded-[8px] px-[10px] py-2">
        <span className="flex-1 text-sm text-muted overflow-hidden text-ellipsis whitespace-nowrap">
          {bookingUrl}
        </span>
        <button
          onClick={copyLink}
          className={cn(
            "shrink-0 text-warm-cream rounded-[8px] py-[5px] px-3 text-xs font-bold",
            "tracking-[0.04em] whitespace-nowrap transition-colors duration-[120ms] cursor-pointer border-none",
            copiedLink ? "bg-sage" : "bg-near-black",
          )}
        >
          {copiedLink ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <Button variant="primary" size="sm" className="flex-1" onClick={copyLink}>
          Share link
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={copyForStory}>
          {copiedStory ? "Copied!" : "To story"}
        </Button>
      </div>
    </Card>
  );
}
