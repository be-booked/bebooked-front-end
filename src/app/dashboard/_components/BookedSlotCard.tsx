"use client";

import { Calendar, Phone, MessageCircle } from "lucide-react";
import { Card, Avatar } from "@/components/ui";
import { LocalSlotTime } from "@/components/LocalSlotTime";

export type BookedSlotCardData = {
  id: number;
  name: string;
  slotDate: string;  // UTC "YYYY-MM-DD"
  slotTime: string;  // UTC "HH:MM"
  mins: number;
  priceDisplay: string;
  clientName: string | null;
  clientPhone: string | null;
};

function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default function BookedSlotCard({ slot }: { slot: BookedSlotCardData }) {
  return (
    <Card variant="raised" radius="md" padding="18px" className="flex flex-col gap-3.5">
      {/* Service + BOOKED badge + price */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-base text-near-black">{slot.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-[3px] bg-sage text-warm-cream text-[11px] font-bold tracking-[0.05em] uppercase rounded-[4px]">
              ✓ Booked
            </span>
          </div>
          <div className="text-sm text-muted flex items-center gap-[5px]">
            <Calendar size={13} strokeWidth={2} className="shrink-0" />
            <LocalSlotTime utcDate={slot.slotDate} utcTime={slot.slotTime} /> · {slot.mins} min
          </div>
        </div>
        <div className="font-bold text-base text-near-black shrink-0 ml-3">
          {slot.priceDisplay}
        </div>
      </div>

      {/* Client info row */}
      {slot.clientName && (
        <div className="flex items-center gap-3 bg-warm-linen rounded-[8px] px-[10px] py-2.5">
          <Avatar name={slot.clientName} size={32} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-near-black leading-snug">
              {slot.clientName}
            </div>
            {slot.clientPhone && (
              <div className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <Phone size={10} strokeWidth={2} className="shrink-0" />
                {formatDisplayPhone(slot.clientPhone)}
              </div>
            )}
          </div>
          {slot.clientPhone && (
            <a
              href={`sms:${slot.clientPhone.replace(/\D/g, "")}`}
              className="shrink-0 size-8 rounded-[8px] bg-near-black flex items-center justify-center text-warm-cream no-underline hover:opacity-80 transition-opacity"
              aria-label={`Text ${slot.clientName}`}
            >
              <MessageCircle size={14} strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
