import { NextResponse } from 'next/server'

import { DkSlateSelection } from '@/features/slate-manager/_types/dkSlate'
import { buildSlateMatchups } from '@/libs/slates/buildSlateMatchups'
import { buildSlatePlayers } from '@/libs/slates/buildSlatePlayers'
import { saveSlateMetadata } from '@/libs/slates/saveSlateMetadata'
import { createServerSupabaseClient } from '@/libs/supabase/server'

// @desc    Get all slates by user
// @route   GET /slates
export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's slate_ids
  const { data: userSlates, error: userSlatesError } = await supabase
    .from('user_slates')
    .select('id')
    .eq('user_id', user.id)

  if (userSlatesError) {
    console.error('Supabase query error:', userSlatesError)
    return NextResponse.json({ error: userSlatesError.message }, { status: 500 })
  }

  const slateIds = (userSlates ?? []).map(r => r.id)
  if (slateIds.length === 0) return NextResponse.json([])

  // Fetch the rest in parallel
  const [
    { data: slates, error: slatesError },
    { data: games },
    { data: players },
    { data: targets },
    { data: rosters },
  ] = await Promise.all([
    supabase.from('user_slates').select('*').in('id', slateIds),
    supabase.from('slate_matchups').select('slate_id').in('slate_id', slateIds),
    supabase.from('slate_players').select('slate_id').in('slate_id', slateIds),
    supabase.from('user_targeted_players').select('slate_id').in('slate_id', slateIds),
    supabase.from('rosters').select('slate_id').in('slate_id', slateIds),
  ])

  if (slatesError) return NextResponse.json({ error: 'Error fetching slate data' }, { status: 500 })

  const countBySlate = (rows: { slate_id: string }[] | null) =>
    (rows ?? []).reduce((acc: { [key: string]: number }, { slate_id }) => {
      acc[slate_id] = (acc[slate_id] ?? 0) + 1
      return acc
    }, {})

  const gameCounts = countBySlate(games)
  const playerCounts = countBySlate(players)
  const targetCounts = countBySlate(targets)
  const rosterCounts = countBySlate(rosters)
  const enriched = (slates ?? []).map(s => ({
    ...s,
    gameCount: gameCounts[s.id] ?? 0,
    playerCount: playerCounts[s.id] ?? 0,
    targetCount: targetCounts[s.id] ?? 0,
    rosterCount: rosterCounts[s.id] ?? 0,
  }))

  return NextResponse.json(enriched)
}

// @desc    Save slate
// @route   POST /slates
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const slateSelection: DkSlateSelection = await req.json()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slate = await saveSlateMetadata(supabase, user.id, slateSelection)
  if (!slate) return NextResponse.json({ error: 'Failed to save slate' }, { status: 500 })

  const matchupSuccess = await buildSlateMatchups(supabase, slate, slateSelection)
  if (!matchupSuccess)
    return NextResponse.json({ error: 'Failed to save matchups' }, { status: 500 })

  const playerSuccess = await buildSlatePlayers(supabase, slate, slateSelection)
  if (!playerSuccess) return NextResponse.json({ error: 'Failed to save players' }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
