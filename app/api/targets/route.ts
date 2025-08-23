// @desc    Save slate

import { NextResponse } from 'next/server'

import { Target } from '@/app/(protected)/cfb/slate-manager/_types/target'
import { createServerSupabaseClient } from '@/libs/supabase/server'

// @desc    Save target
// @route   POST /targets
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()

  const target: Target = await req.json()
  console.log(target)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error: slateError } = await supabase
    .from('user_targeted_players')
    .insert({
      user_id: user.id,
      slate_id: target.slate_id,
      slate_player_id: target.id,
      player_id: target.player_id,
      stack_candidate: target.stack_candidate,
      target_notes: target.target_notes,
      target_type: target.target_type,
    })
    .select()
    .single()

  if (slateError) {
    console.error('❌ Supabase insert error:', slateError.message)
    return NextResponse.json({ error: 'Failed to insert slate' }, { status: 500 })
  }

  return NextResponse.json({ success: true, target: data }, { status: 201 })
}

// @desc    Update target
// @route   PATCH /targets
export async function PATCH(req: Request) {
  const supabase = await createServerSupabaseClient()

  const target: Target = await req.json()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_targeted_players')
    .update({
      stack_candidate: target.stack_candidate,
      target_notes: target.target_notes,
      target_type: target.target_type,
    })
    .eq('id', target.id)
    .select()
    .single()

  if (error) {
    console.error('❌ Supabase insert error:', error.message)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }

  return NextResponse.json({ success: true, target: data }, { status: 201 })
}
