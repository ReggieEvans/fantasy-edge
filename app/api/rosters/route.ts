import { NextResponse } from 'next/server'

import { Roster, RosterSlot } from '@/app/(protected)/cfb/slate-manager/_types/roster'
import { createServerSupabaseClient } from '@/libs/supabase/server'

// @desc    Save roster
// @route   POST /rosters
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()

  const {
    slateId,
    name,
    type,
    totalSalary,
    roster, // object with keys = slot keys, values = player objects
  }: Roster = await req.json()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 1: Insert into rosters
  const { data: rosterInsert, error: rosterError } = await supabase
    .from('rosters')
    .insert({
      user_id: user.id,
      slate_id: slateId,
      name,
      type,
      total_salary: totalSalary,
    })
    .select()
    .single()

  if (rosterError || !rosterInsert) {
    return NextResponse.json({ error: rosterError?.message ?? 'Failed to insert roster' }, { status: 500 })
  }

  const rosterId = rosterInsert.id

  const playerRows = Object.entries(roster).map(([slotKey, player]: [string, RosterSlot]) => ({
    roster_id: rosterId,
    slot_key: slotKey,
    player_id: player.player_id,
    player_name: player.player_name,
    draftable_id: player.draftable_id,
    slate_player_id: player.slate_player_id,
    position: player.position,
    salary: player.salary,
    target_type: player.target_type,
    stack_candidate: player.stack_candidate,
  }))

  const { error: playerInsertError } = await supabase.from('roster_players').insert(playerRows)

  if (playerInsertError) {
    return NextResponse.json({ error: playerInsertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Roster saved successfully', rosterId }, { status: 200 })
}
