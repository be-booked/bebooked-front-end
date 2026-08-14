"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui";

interface ShareProfileButtonProps {
  name: string;
  url: string;
}

export function ShareProfileButton({ name, url }: ShareProfileButtonProps) {
  async function share() {
    const shareData = {
      title: `Book with ${name}`,
      text:  `Check out ${name}'s open slots — book a last-minute appointment.`,
      url,
    };

    if (typeof navigator.share === "function" && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex items-center gap-1.5"
      onClick={share}
    >
      <Share2 size={14} strokeWidth={2.5} />
      Share
    </Button>
  );
}
