"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Input, Textarea, FormError } from "@/components/ui";
import { INDUSTRIES, specialtiesForIndustries } from "@/lib/taxonomy";
import { cn } from "@/lib/cn";

// ── Field validators ───────────────────────────────────────────────────────

function validateName(v: string): string | undefined {
  if (!v.trim()) return "Name is required";
  if (v.length > 100) return "Name must be 100 characters or less";
}

function validateSlug(v: string): string | undefined {
  if (!v.trim()) return "Handle is required";
  if (!/^[a-z0-9-]+$/.test(v)) return "Lowercase letters, numbers, and hyphens only";
  if (v.length > 60) return "Handle must be 60 characters or less";
}

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function validatePhone(v: string): string | undefined {
  if (!v.trim()) return "Phone number is required";
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return "Enter a valid 10-digit US phone number";
}

function validateStreet(v: string): string | undefined {
  if (!v.trim()) return "Street address is required";
}

function validateCity(v: string): string | undefined {
  if (!v.trim()) return "City is required";
}

function validateState(v: string): string | undefined {
  if (!v.trim()) return "State is required";
  if (!/^[A-Z]{2}$/.test(v.toUpperCase().trim())) return "Enter a 2-letter state code (e.g. NC)";
}

function validateZip(v: string): string | undefined {
  if (!v.trim()) return "ZIP code is required";
  if (!/^\d{5}(-\d{4})?$/.test(v.trim())) return "Enter a valid ZIP code (e.g. 28202)";
}

function validateCancellationPolicy(v: string): string | undefined {
  if (!v.trim()) return "Cancellation policy is required";
  if (v.length > 150) return "Cancellation policy must be 150 characters or less";
}

// ── Chip ───────────────────────────────────────────────────────────────────

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-semibold border transition-colors rounded-none leading-none",
        selected
          ? "bg-near-black text-warm-cream border-near-black"
          : "bg-transparent text-near-black border-stone hover:border-warm-gray"
      )}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-3">{children}</p>
  );
}

// ── Props + handle ─────────────────────────────────────────────────────────

export interface ProfileFieldsProps {
  showSlug?: boolean;
  defaultName?: string;
  defaultSlug?: string;
  defaultStudio?: string;
  defaultBio?: string;
  defaultPhone?: string;
  defaultAddressStreet?: string;
  defaultAddressCity?: string;
  defaultAddressState?: string;
  defaultAddressZip?: string;
  defaultIndustry?: string[];
  defaultSpecialties?: string[];
  defaultCancellationPolicy?: string;
}

/** Lets parent components trigger full validation on submit. */
export interface ProfileFieldsHandle {
  /** Runs all validators, highlights failing fields, returns true if all pass. */
  validateAll: () => boolean;
}

type FieldErrors = Partial<Record<
  | "name" | "slug" | "phone"
  | "addressStreet" | "addressCity" | "addressState" | "addressZip"
  | "cancellationPolicy" | "industry",
  string
>>;

// ── Component ──────────────────────────────────────────────────────────────

export const ProfileFields = forwardRef<ProfileFieldsHandle, ProfileFieldsProps>(
  function ProfileFields(
    {
      showSlug = false,
      defaultName = "",
      defaultSlug = "",
      defaultStudio = "",
      defaultBio = "",
      defaultPhone = "",
      defaultAddressStreet = "",
      defaultAddressCity = "",
      defaultAddressState = "",
      defaultAddressZip = "",
      defaultIndustry = [],
      defaultSpecialties = [],
      defaultCancellationPolicy = "",
    },
    ref
  ) {
    const [name,               setName]               = useState(defaultName);
    const [slug,               setSlug]               = useState(defaultSlug);
    const [phone,              setPhone]              = useState(formatPhone(defaultPhone));
    const [bio,                setBio]                = useState(defaultBio);
    const [addressStreet,      setAddressStreet]      = useState(defaultAddressStreet);
    const [addressCity,        setAddressCity]        = useState(defaultAddressCity);
    const [addressState,       setAddressState]       = useState(defaultAddressState.toUpperCase());
    const [addressZip,         setAddressZip]         = useState(defaultAddressZip);
    const [cancellationPolicy, setCancellationPolicy] = useState(defaultCancellationPolicy);
    const [errors,             setErrors]             = useState<FieldErrors>({});

    const [selectedIndustries,  setSelectedIndustries]  = useState<string[]>(defaultIndustry);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(defaultSpecialties);

    // ── Imperative handle ──────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      validateAll() {
        const next: FieldErrors = {
          name:               validateName(name),
          phone:              validatePhone(phone),
          addressStreet:      validateStreet(addressStreet),
          addressCity:        validateCity(addressCity),
          addressState:       validateState(addressState),
          addressZip:         validateZip(addressZip),
          cancellationPolicy: validateCancellationPolicy(cancellationPolicy),
          industry:           selectedIndustries.length === 0 ? "Select at least one specialty" : undefined,
          ...(showSlug ? { slug: validateSlug(slug) } : {}),
        };
        setErrors(next);
        return !Object.values(next).some(Boolean);
      },
    }), [name, slug, phone, addressStreet, addressCity, addressState, addressZip, cancellationPolicy, selectedIndustries, showSlug]);

    // ── Field handlers ─────────────────────────────────────────────────────

    function handleNameChange(v: string) {
      setName(v);
      if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
    }
    function handleSlugChange(v: string) {
      const fmt = v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setSlug(fmt);
      if (errors.slug) setErrors((e) => ({ ...e, slug: undefined }));
    }
    function handlePhoneChange(v: string) {
      setPhone(formatPhone(v));
      if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
    }
    function handleStreetChange(v: string) {
      setAddressStreet(v);
      if (errors.addressStreet) setErrors((e) => ({ ...e, addressStreet: undefined }));
    }
    function handleCityChange(v: string) {
      setAddressCity(v);
      if (errors.addressCity) setErrors((e) => ({ ...e, addressCity: undefined }));
    }
    function handleStateChange(v: string) {
      const fmt = v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
      setAddressState(fmt);
      if (errors.addressState) setErrors((e) => ({ ...e, addressState: undefined }));
    }
    function handleZipChange(v: string) {
      setAddressZip(v);
      if (errors.addressZip) setErrors((e) => ({ ...e, addressZip: undefined }));
    }
    function handleCancellationPolicyChange(v: string) {
      setCancellationPolicy(v);
      if (errors.cancellationPolicy) setErrors((e) => ({ ...e, cancellationPolicy: undefined }));
    }

    // ── Industry chips ─────────────────────────────────────────────────────

    function toggleIndustry(value: string) {
      setSelectedIndustries((prev) => {
        const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
        const valid = specialtiesForIndustries(next).map((s) => s.value);
        setSelectedSpecialties((sp) => sp.filter((s) => valid.includes(s)));
        if (next.length > 0 && errors.industry) setErrors((e) => ({ ...e, industry: undefined }));
        return next;
      });
    }
    function toggleSpecialty(value: string) {
      setSelectedSpecialties((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
    const availableSpecialties = specialtiesForIndustries(selectedIndustries);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
      <>
        {/* Hidden inputs for array fields */}
        {selectedIndustries.map((v) => (
          <input key={`ind-${v}`} type="hidden" name="industry" value={v} />
        ))}
        {selectedSpecialties.map((v) => (
          <input key={`spec-${v}`} type="hidden" name="specialties" value={v} />
        ))}

        {/* ── Basic info ── */}
        <div className="mb-7">
          <SectionLabel>Basic info</SectionLabel>
          <div className="flex flex-col gap-4">
            <Input
              label="Your name"
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setErrors((e) => ({ ...e, name: validateName(name) }))}
              error={errors.name}
              placeholder="e.g. Jordan Avery"
              autoComplete="name"
            />
            {showSlug && (
              <Input
                label="Handle"
                name="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() => setErrors((e) => ({ ...e, slug: validateSlug(slug) }))}
                error={errors.slug}
                placeholder="your-handle"
                prefix="bebookedtoday.com/"
                hint={errors.slug ? undefined : "Lowercase letters, numbers, and hyphens only."}
              />
            )}
            <Input
              label="Studio / business"
              name="studio"
              defaultValue={defaultStudio}
              placeholder="e.g. Avery Hair Co."
              autoComplete="organization"
              maxLength={100}
            />
            <div>
              <Textarea
                label="Bio"
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={250}
                placeholder="A short line about you and your work"
                rows={3}
              />
              <div className="text-right text-[11px] text-muted mt-1">{bio.length}/250</div>
            </div>
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="mb-7">
          <SectionLabel>Contact</SectionLabel>
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => setErrors((e) => ({ ...e, phone: validatePhone(phone) }))}
            error={errors.phone}
            placeholder="(704) 555-0100"
            hint={errors.phone ? undefined : "Clients see this on their confirmation page."}
            autoComplete="tel"
          />
        </div>

        {/* ── Studio address ── */}
        <div className="mb-7">
          <SectionLabel>Studio address</SectionLabel>
          <div className="flex flex-col gap-4">
            <Input
              label="Street"
              name="addressStreet"
              value={addressStreet}
              onChange={(e) => handleStreetChange(e.target.value)}
              onBlur={() => setErrors((e) => ({ ...e, addressStreet: validateStreet(addressStreet) }))}
              error={errors.addressStreet}
              placeholder="123 Main St"
              autoComplete="street-address"
              maxLength={200}
            />
            <Input
              label="City"
              name="addressCity"
              value={addressCity}
              onChange={(e) => handleCityChange(e.target.value)}
              onBlur={() => setErrors((e) => ({ ...e, addressCity: validateCity(addressCity) }))}
              error={errors.addressCity}
              placeholder="Charlotte"
              autoComplete="address-level2"
              maxLength={100}
            />
            <div className="flex gap-3">
              <Input
                label="State"
                name="addressState"
                value={addressState}
                onChange={(e) => handleStateChange(e.target.value)}
                onBlur={() => setErrors((e) => ({ ...e, addressState: validateState(addressState) }))}
                error={errors.addressState}
                placeholder="NC"
                autoComplete="address-level1"
                className="w-[90px] shrink-0"
                maxLength={2}
              />
              <Input
                label="ZIP code"
                name="addressZip"
                value={addressZip}
                onChange={(e) => handleZipChange(e.target.value)}
                onBlur={() => setErrors((e) => ({ ...e, addressZip: validateZip(addressZip) }))}
                error={errors.addressZip}
                placeholder="28202"
                autoComplete="postal-code"
                maxLength={10}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* ── Industry & specialties ── */}
        <div className="mb-7">
          <SectionLabel>Your specialty</SectionLabel>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted mb-2">What do you do? Select at least one.</p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(({ value, label }) => (
                  <Chip
                    key={value}
                    label={label}
                    selected={selectedIndustries.includes(value)}
                    onClick={() => toggleIndustry(value)}
                  />
                ))}
              </div>
              <FormError message={errors.industry} className="mt-2" />
            </div>
            {availableSpecialties.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Pick your specialties.</p>
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map(({ value, label }) => (
                    <Chip
                      key={value}
                      label={label}
                      selected={selectedSpecialties.includes(value)}
                      onClick={() => toggleSpecialty(value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Booking policy ── */}
        <div className="mb-7">
          <SectionLabel>Booking policy</SectionLabel>
          <Textarea
            label="Cancellation policy"
            id="cancellationPolicy"
            name="cancellationPolicy"
            value={cancellationPolicy}
            onChange={(e) => handleCancellationPolicyChange(e.target.value)}
            onBlur={() => setErrors((e) => ({ ...e, cancellationPolicy: validateCancellationPolicy(cancellationPolicy) }))}
            error={errors.cancellationPolicy}
            placeholder="e.g. Cancellations within 24 hours are non-refundable."
            rows={3}
            maxLength={150}
            hint={errors.cancellationPolicy ? undefined : `${cancellationPolicy.length}/150 · Shown to clients before they book.`}
          />
        </div>
      </>
    );
  }
);
