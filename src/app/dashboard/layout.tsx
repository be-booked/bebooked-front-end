import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { AppBar } from "./_components/AppBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Non-blocking: if the DB is unreachable the AppBar still renders with
  // empty identity rather than taking the whole dashboard down.
  let stylist: Awaited<ReturnType<typeof getStylistByClerkId>> = undefined;
  try {
    stylist = await getStylistByClerkId(userId);
  } catch {
    // no-op
  }

  return (
    <>
      <AppBar
        name={stylist?.name ?? ""}
        slug={stylist?.slug ?? ""}
        photoUrl={stylist?.photoUrl ?? null}
      />
      {children}
    </>
  );
}
