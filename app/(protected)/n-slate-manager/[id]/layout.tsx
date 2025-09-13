import SlateManagerShell from '@/features/slate-manager/_shell/SlateManagerShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SlateManagerShell>{children}</SlateManagerShell>
}
