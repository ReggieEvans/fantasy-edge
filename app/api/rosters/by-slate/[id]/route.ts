import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

// @desc    Get roster
// @route   GET /rosters/:id
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rosters, error: queryError } = await supabase
    .from('rosters')
    .select(
      `
    id,
    name,
    type,
    total_salary,
    slate_id,
    roster_players:roster_players!roster_players_roster_id_fkey (
      id,
      roster_id,
      slot_key,
      player_id,
      salary,
      position,
      target_type,
      stack_candidate,
      player_name,
      draftable_id,
      slate_player_id,
      projection,
      team_name,
      slot_position
    )
  `,
    )
    .eq('slate_id', slateId)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json(rosters)
}
