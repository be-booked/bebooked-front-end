"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui";
import { getPhotoUploadUrl, savePhotoUrl } from "../actions";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED   = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  name: string;
  currentUrl: string | null;
}

type State = "idle" | "uploading" | "error";

export default function PhotoUpload({ name, currentUrl }: Props) {
  const inputRef             = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(currentUrl);
  const [state,    setState]    = useState<State>("idle");
  const [errMsg,   setErrMsg]   = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!ALLOWED.includes(file.type)) {
      setErrMsg("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrMsg("Photo must be under 5 MB.");
      return;
    }

    setState("uploading");
    setErrMsg(null);

    try {
      // 1. Get presigned URL from server
      const { uploadUrl, filePublicUrl } = await getPhotoUploadUrl(file.type);

      // 2. PUT directly to R2 — server never touches the bytes
      const res = await fetch(uploadUrl, {
        method:  "PUT",
        body:    file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      // 3. Save URL to DB
      await savePhotoUrl(filePublicUrl);

      setPhotoUrl(filePublicUrl);
      setState("idle");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Upload failed. Try again.");
      setState("error");
    } finally {
      // Reset input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-5 mb-7">
      {/* Clickable avatar */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
        className="relative group cursor-pointer bg-transparent border-none p-0 rounded-full shrink-0 disabled:cursor-wait"
        aria-label="Change profile photo"
      >
        <Avatar name={name} src={photoUrl ?? undefined} size={72} />

        {/* Camera overlay */}
        <span className="absolute inset-0 rounded-full bg-near-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
          <Camera size={20} strokeWidth={1.75} className="text-warm-cream" />
        </span>

        {/* Uploading spinner ring */}
        {state === "uploading" && (
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-sage animate-spin" />
        )}
      </button>

      {/* Label + status */}
      <div>
        <p className="text-sm font-semibold text-near-black mb-0.5">Profile photo</p>
        <p className="text-xs text-muted leading-relaxed">
          {state === "uploading"
            ? "Uploading…"
            : "JPEG, PNG, or WebP · max 5 MB"}
        </p>
        {errMsg && (
          <p className="text-xs text-danger mt-1">{errMsg}</p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
