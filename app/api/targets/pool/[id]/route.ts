import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userTargets, error: queryError } = await supabase
    .from('user_targeted_players')
    .select('*')
    .eq('user_id', user.id)
    .eq('slate_id', slateId)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  if (!userTargets || userTargets.length === 0) {
    return NextResponse.json([])
  }

  const playerIds = userTargets.map(t => t.player_id)

  const { data: players } = await supabase
    .from('slate_players')
    .select('*')
    .in('player_id', playerIds)

  const teamIds = players?.map(p => p.team_id) ?? []
  const { data: teams } = await supabase
    .from('teams')
    .select('id, full_name, draftkings_abbreviation')
    .in('id', teamIds)

  const targets = userTargets.map(t => {
    const player = players?.find(p => p.player_id === t.player_id)
    const team = teams?.find(team => team.id === player?.team_id)

    return {
      ...t,
      ...player,
      id: t.id,
      team_name: team?.full_name ?? null,
      team_abbreviation: team?.draftkings_abbreviation ?? null,
    }
  })

  return NextResponse.json(targets)
}
