// Intentionally empty — setup is wrapped by dashboard/layout.tsx.
// Nav visibility is controlled in DashboardNav via pathname check.
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
