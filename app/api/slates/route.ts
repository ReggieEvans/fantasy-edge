import { NextResponse } from 'next/server'

import { DkSlateSelection } from '@/app/(protected)/cfb/slate-manager/_types/dkSlate'
import { buildSlateMatchups } from '@/libs/slates/buildSlateMatchups'
import { buildSlatePlayers } from '@/libs/slates/buildSlatePlayers'
import { saveSlateMetadata } from '@/libs/slates/saveSlateMetadata'
import { createServerSupabaseClient } from '@/libs/supabase/server'
import { countBySlate } from '@/libs/utils'

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

  const slateIds = userSlates.map(row => row.id)

  // Get slate metadata
  const { data: slates, error: slatesError } = await supabase.from('user_slates').select('*').in('id', slateIds)

  if (slatesError) {
    return NextResponse.json({ error: 'Error fetching slate data' }, { status: 500 })
  }

  const { data: games } = await supabase
    .from('slate_matchups')
    .select('slate_id') // only need slate_id
    .in('slate_id', slateIds)

  // const { data: players } = await supabase.from('slate_players').select('slate_id').in('slate_id', slateIds)

  const gameCountsMap = countBySlate(games ?? [])
  // const playerCountsMap = countBySlate(players ?? [])

  // Enrich slates with games and players
  const enrichedSlates = slates.map(slate => ({
    ...slate,
    gameCount: gameCountsMap[slate.id] || 0,
    // playerCount: playerCountsMap[slate.id] || 0,
  }))

  return NextResponse.json(enrichedSlates)
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
  if (!matchupSuccess) return NextResponse.json({ error: 'Failed to save matchups' }, { status: 500 })

  const playerSuccess = await buildSlatePlayers(supabase, slate, slateSelection)
  if (!playerSuccess) return NextResponse.json({ error: 'Failed to save players' }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
