import { SettingsFrame } from "@/features/settings/settings-frame"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsFrame>{children}</SettingsFrame>
}
