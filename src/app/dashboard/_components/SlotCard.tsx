"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { APP_URL, APP_HOST } from "@/lib/url";

export type SlotCardData = {
  id: number;
  name: string;
  when: string;
  mins: number;
  priceDisplay: string;
  shortCode: string;
};

export default function SlotCard({ slot }: { slot: SlotCardData }) {
  const [copied, setCopied] = useState(false);

  const bookingUrl = `${APP_HOST}/b/${slot.shortCode}`;
  const fullUrl    = `${APP_URL}/b/${slot.shortCode}`;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  async function shareSlot() {
    const shareData = {
      title: `Book a ${slot.name}`,
      text:  `I have an opening! Grab a ${slot.name} (${slot.mins} min · ${slot.priceDisplay}) — book it before it's gone.`,
      url:   fullUrl,
    };

    if (typeof navigator.share === "function" && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no-op
      }
    } else {
      // Desktop fallback: copy to clipboard
      copyLink();
    }
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
            copied ? "bg-sage" : "bg-near-black",
          )}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Share button */}
      <Button
        variant="primary"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
        onClick={shareSlot}
      >
        <Share2 size={15} strokeWidth={2.5} />
        Share
      </Button>
    </Card>
  );
}
