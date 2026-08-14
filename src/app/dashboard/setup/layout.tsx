// Intentionally empty — setup is wrapped by dashboard/layout.tsx.
// AppBar hides itself on /dashboard/setup via a pathname check.
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
