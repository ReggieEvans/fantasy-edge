import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() ?? '' // search by name (case-insensitive)
  const position = url.searchParams.get('position') ?? '' // QB/RB/WR/TE/etc.
  const includeAllSalaries = url.searchParams.get('includeAllSalaries') // "true" | "false"
  const maxSalaryStr = url.searchParams.get('maxSalary') // remaining salary (if toggled on)
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(25, Number(url.searchParams.get('pageSize') ?? '50'))) // cap page size
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  // 1) fetch targeted IDs (small per user/slate)
  const { data: targeted, error: tgtErr } = await supabase
    .from('user_targeted_players')
    .select('player_id')
    .eq('user_id', user.id)
    .eq('slate_id', slateId)

  if (tgtErr) return NextResponse.json({ error: tgtErr.message }, { status: 500 })
  const targetedIds = (targeted ?? []).map(t => t.player_id)

  // 2) build base query
  let query = supabase
    .from('slate_players')
    .select(
      `
    id,
    player_id,
    full_name,
    position,
    salary,
    slate_id,
    projection,
    team_id,
    team:teams!slate_players_team_id_fkey (
      id,
      full_name
    )
  `,
      { count: 'exact' },
    )
    .eq('slate_id', slateId)
    .order('salary', { ascending: false })

  // 3) filters
  if (position) query = query.eq('position', position)
  if (q) query = query.ilike('full_name', `%${q}%`) // assumes 'player_name' column
  if (targetedIds.length) {
    // exclude targeted via NOT IN
    // supabase .not('col','in','(1,2,3)') needs a parenthesized CSV
    const list = `(${targetedIds.join(',')})` // no quotes
    query = query.not('player_id', 'in', list)
  }
  if (includeAllSalaries !== 'true' && maxSalaryStr) {
    const maxSalary = Number(maxSalaryStr)
    if (!Number.isNaN(maxSalary)) query = query.lte('salary', maxSalary)
  }

  // 4) pagination window
  query = query.range(start, end)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > end + 1,
  })
}
