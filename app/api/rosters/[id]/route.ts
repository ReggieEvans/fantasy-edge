import { NextResponse } from 'next/server'

import { RosterType } from '@/features/slate-manager/roster-view/ui/RosterTypeMeta'
import { createServerSupabaseClient } from '@/libs/supabase/server'

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: rosterId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rosterValues: { name: string | undefined; type: RosterType | null | undefined } =
    await req.json()

  if (rosterValues.name != null || rosterValues.type != null) {
    const updateFields: Record<string, unknown> = {}
    if (rosterValues.name != null) updateFields.name = rosterValues.name
    if (rosterValues.type != null) updateFields.type = rosterValues.type

    const { error: updErr } = await supabase.from('rosters').update(updateFields).eq('id', rosterId)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// @desc    Delete a roster (by rosterId)
// @route   DELETE /rosters/:id
export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: rosterId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error: delRosterErr } = await supabase.from('rosters').delete().eq('id', rosterId)
  if (delRosterErr) return NextResponse.json({ error: delRosterErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
