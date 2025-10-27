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
  const q = url.searchParams.get('q')?.trim() ?? ''
  const position = url.searchParams.get('position') ?? ''
  const includeAllSalaries = url.searchParams.get('includeAllSalaries')
  const maxSalaryStr = url.searchParams.get('maxSalary')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(25, Number(url.searchParams.get('pageSize') ?? '50')))
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  const { data: targeted, error: tgtErr } = await supabase
    .from('user_targeted_players')
    .select('player_id')
    .eq('user_id', user.id)
    .eq('slate_id', slateId)

  if (tgtErr) return NextResponse.json({ error: tgtErr.message }, { status: 500 })
  const targetedIds = (targeted ?? []).map(t => t.player_id)

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

  if (position) query = query.eq('position', position)
  if (q) query = query.ilike('full_name', `%${q}%`)
  if (targetedIds.length) {
    const list = `(${targetedIds.join(',')})`
    query = query.not('player_id', 'in', list)
  }
  if (includeAllSalaries !== 'true' && maxSalaryStr) {
    const maxSalary = Number(maxSalaryStr)
    if (!Number.isNaN(maxSalary)) query = query.lte('salary', maxSalary)
  }

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
