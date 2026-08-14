"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, MapPin, Clock, Phone, X } from "lucide-react";
import { Avatar, EyebrowLabel, IconButton } from "@/components/ui";

export interface AboutStylistProps {
  name: string;
  /** "Avery Hair Co. · Charlotte, NC" */
  meta: string;
  photoUrl: string | null;
  bio: string | null;
  specialties: string[];
  /** Full street address, already formatted. Empty string when unset. */
  address: string;
  cancellationPolicy: string | null;
  /** Whether the stylist has a phone on file — drives the "reminders by text" line. */
  hasPhone: boolean;
}

function AboutSheet({
  name,
  meta,
  photoUrl,
  bio,
  specialties,
  address,
  cancellationPolicy,
  hasPhone,
  onClose,
}: AboutStylistProps & { onClose: () => void }) {
  // Lock background scroll + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const goodToKnow = [
    address && { icon: MapPin, text: address },
    cancellationPolicy && { icon: Clock, text: cancellationPolicy },
    hasPhone && { icon: Phone, text: "Confirmation and reminders by text." },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-near-black/35"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet on mobile, centered panel on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`About ${name}`}
        className="fixed left-0 right-0 bottom-0 z-50 max-h-[82%] overflow-y-auto
                   bg-warm-cream rounded-t-[22px] shadow-hover
                   md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2 md:max-h-[78%]"
      >
        {/* Grabber */}
        <div className="w-[38px] h-1 rounded-full bg-stone mx-auto mt-2.5" aria-hidden="true" />

        <div className="px-6 pt-[18px] pb-7">
          {/* Head */}
          <div className="flex items-center gap-[13px] mb-5">
            <Avatar name={name} src={photoUrl ?? undefined} size={48} />
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold text-near-black leading-snug">{name}</div>
              {meta && <div className="text-sm text-muted">{meta}</div>}
            </div>
            <IconButton label="Close" size="sm" variant="ghost" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </div>

          {bio && (
            <p className="text-[15px] leading-relaxed text-warm-gray m-0">{bio}</p>
          )}

          {specialties.length > 0 && (
            <div className="mt-[22px]">
              <EyebrowLabel>Specializes in</EyebrowLabel>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[13px] font-medium text-near-black bg-warm-linen px-[13px] py-[7px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {goodToKnow.length > 0 && (
            <div className="mt-[22px]">
              <EyebrowLabel className="block mb-1">Good to know</EyebrowLabel>
              {goodToKnow.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex gap-2.5 py-[11px] border-t border-hairline text-sm text-warm-gray leading-[1.45]"
                >
                  <span className="shrink-0 text-muted flex mt-px">
                    <Icon size={16} />
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

/**
 * Clamped bio + "More about {firstName}" trigger that opens a detail sheet.
 * Renders nothing when there's no extra detail worth surfacing.
 */
export function AboutStylist(props: AboutStylistProps) {
  const [open, setOpen] = useState(false);

  const { bio, specialties, address, cancellationPolicy, name } = props;

  // Only worth a sheet if there's more than the hero already shows
  const hasDetail =
    specialties.length > 0 || !!address || !!cancellationPolicy || (bio?.length ?? 0) > 120;

  const firstName = name.split(" ")[0] || name;

  return (
    <>
      {bio && (
        <p className="text-sm text-warm-gray mt-[10px] leading-relaxed max-w-[460px] line-clamp-2">
          {bio}
        </p>
      )}

      {hasDetail && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-[5px] mt-2 py-1.5 bg-transparent border-none
                     text-sm font-semibold text-sage cursor-pointer hover:underline"
        >
          More about {firstName}
          <ChevronRight size={15} />
        </button>
      )}

      {open && <AboutSheet {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
