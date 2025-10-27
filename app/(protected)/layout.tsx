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
      <main className="hidden 2xl:block">{children}</main>
      <main className="block 2xl:hidden">
        <div className="flex items-center justify-center h-full text-center text-lg font-bold text-muted py-24 max-w-[500px] mx-auto">
          Due to the large amount of data, tables, and charts on this site, it&apos;s recommended to
          view this site on a desktop.
        </div>
      </main>
    </>
  )
}
