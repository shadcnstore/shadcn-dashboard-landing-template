import { AuthShell } from "@/features/auth/auth-shell"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>
}
