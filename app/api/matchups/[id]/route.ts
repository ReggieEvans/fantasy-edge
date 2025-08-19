// @desc    Get Matchups by slateId
// @route   GET /api/matchups/:id
import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  try {
    const { data: matchups } = await supabase.from('slate_matchups').select('*').eq('slate_id', slateId)

    return NextResponse.json(matchups)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
