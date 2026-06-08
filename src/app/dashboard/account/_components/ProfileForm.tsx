"use client";

import { useState, useTransition } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button, Input, Textarea, EyebrowLabel } from "@/components/ui";
import { updateProfile } from "../actions";

interface ProfileFormProps {
  name: string;
  slug: string;
  studio: string | null;
  bio: string | null;
}

export default function ProfileForm({ name, slug, studio, bio }: ProfileFormProps) {
  const { signOut } = useClerk();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
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
    <div className="flex flex-col gap-10">
      {/* Profile section */}
      <section>
        <EyebrowLabel className="block mb-5">Profile</EyebrowLabel>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <Input label="Name" name="name" defaultValue={name} required placeholder="Your full name" />
          <Input
            label="Handle"
            name="slug"
            defaultValue={slug}
            required
            placeholder="your-handle"
            prefix="bebookedtoday.com/"
            hint="Lowercase letters, numbers, and hyphens only. This is your public profile URL."
          />
          <Input label="Studio / salon name" name="studio" defaultValue={studio ?? ""} placeholder="e.g. Studio 7" />
          <Textarea
            label="Bio"
            id="bio"
            name="bio"
            defaultValue={bio ?? ""}
            placeholder="A short line about you and your work"
            rows={3}
            maxLength={250}
          />

          {error && <p className="text-sm text-danger m-0">{error}</p>}

          <Button type="submit" variant="primary" disabled={isPending} className="self-start">
            {isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Account section */}
      <section className="border-t border-hairline pt-8">
        <EyebrowLabel className="block mb-5">Account</EyebrowLabel>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          Signing out will end your current session.
        </p>
        <Button
          variant="secondary"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="border-danger text-danger"
        >
          Sign out
        </Button>
      </section>
    </div>
  );
}
