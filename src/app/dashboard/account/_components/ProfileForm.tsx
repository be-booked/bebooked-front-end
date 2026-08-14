"use client";

import { useRef, useState, useTransition } from "react";
import { Button, FormError } from "@/components/ui";
import { ProfileFields, type ProfileFieldsHandle } from "@/app/dashboard/_components/ProfileFields";
import { updateProfile } from "../actions";

interface ProfileFormProps {
  name: string;
  slug: string;
  studio: string | null;
  bio: string | null;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  industry: string[] | null;
  specialties: string[] | null;
  cancellationPolicy: string | null;
}

export default function ProfileForm({
  name,
  slug,
  studio,
  bio,
  phone,
  addressStreet,
  addressCity,
  addressState,
  addressZip,
  industry,
  specialties,
  cancellationPolicy,
}: ProfileFormProps) {
  const fieldsRef = useRef<ProfileFieldsHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    // Trigger per-field validation — highlights failing fields, stops if any fail
    const valid = fieldsRef.current?.validateAll();
    if (!valid) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <ProfileFields
        ref={fieldsRef}
        showSlug
        defaultName={name}
        defaultSlug={slug}
        defaultStudio={studio ?? ""}
        defaultBio={bio ?? ""}
        defaultPhone={phone ?? ""}
        defaultAddressStreet={addressStreet ?? ""}
        defaultAddressCity={addressCity ?? ""}
        defaultAddressState={addressState ?? ""}
        defaultAddressZip={addressZip ?? ""}
        defaultIndustry={industry ?? []}
        defaultSpecialties={specialties ?? []}
        defaultCancellationPolicy={cancellationPolicy ?? ""}
      />

      <FormError message={error} className="mb-4" />

      <Button type="submit" variant="primary" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </Button>
    </form>
  );
}
