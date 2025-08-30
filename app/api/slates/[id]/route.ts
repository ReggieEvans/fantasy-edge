// @desc    Delete User Slate
// @route   DELETE /api/slates/:id
import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await supabase.from('slate_matchups').delete().eq('slate_id', slateId)
    await supabase.from('rosters').delete().eq('slate_id', slateId)
    await supabase.from('slate_players').delete().eq('slate_id', slateId)
    await supabase.from('user_slates').delete().eq('id', slateId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
