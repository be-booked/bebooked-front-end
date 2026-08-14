"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui";

export function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <Button
      variant="secondary"
      className="border-danger text-danger"
      onClick={() => signOut({ redirectUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
