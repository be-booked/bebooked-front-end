import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "./_components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      {/* Bottom nav height is ~60px + safe area — pb-24 gives comfortable clearance */}
      <div className="pb-24">
        {children}
      </div>
      <DashboardNav />
    </>
  );
}
