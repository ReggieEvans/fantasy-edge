// @desc    Get User Targets
// @route   GET /api/targets/:id
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

  const { data: userTargets, error: queryError } = await supabase
    .from('user_targeted_players')
    .select()
    .eq('user_id', user.id)
    .eq('slate_id', slateId)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json(userTargets)
}

// @desc    Delete User Target
// @route   DELETE /api/targets/:id
export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await supabase.from('user_targeted_players').delete().eq('id', id).eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
