"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

export type SlotCardData = {
  id: number;
  name: string;
  when: string;
  mins: number;
  priceDisplay: string; // "$220"
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
    <Card
      variant="raised"
      radius="md"
      style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px" }}
    >
      {/* Name + price row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontWeight: "var(--weight-bold)",
              fontSize: "var(--size-body)",
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {slot.name}
          </div>
          <div
            style={{
              fontSize: "var(--size-small)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {slot.when} · {slot.mins} min
          </div>
        </div>
        <div
          style={{
            fontWeight: "var(--weight-bold)",
            fontSize: "var(--size-body)",
            color: "var(--text-primary)",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          {slot.priceDisplay}
        </div>
      </div>

      {/* Copy link row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--warm-linen)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 10px",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: "var(--size-small)",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-sans)",
          }}
        >
          {bookingUrl}
        </span>
        <button
          onClick={copyLink}
          style={{
            flexShrink: 0,
            background: copiedLink ? "var(--sage)" : "var(--near-black)",
            color: "var(--warm-cream)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: "var(--weight-bold)",
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background var(--dur-fast) var(--ease-standard)",
            whiteSpace: "nowrap",
          }}
        >
          {copiedLink ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button
          variant="primary"
          size="sm"
          style={{ flex: 1 }}
          onClick={copyLink}
        >
          Share link
        </Button>
        <Button
          variant="secondary"
          size="sm"
          style={{ flex: 1 }}
          onClick={copyForStory}
        >
          {copiedStory ? "Copied!" : "To story"}
        </Button>
      </div>
    </Card>
  );
}
