import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/libs/supabase/server'
import Header from '@/shared/ui/Header'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
