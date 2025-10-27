import { NextRequest, NextResponse } from 'next/server'

import { DkContestDTO, DkContestsResponseDTO } from '@/features/slate-manager/_dtos/dkContests.dto'
import { DkSlateDTO } from '@/features/slate-manager/_dtos/dkSlate.dto'
import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const sport = searchParams.get('sport')
  const gameType = searchParams.get('gameType')

  if (!sport || !gameType) {
    return NextResponse.json({ error: 'Missing sport or gameType' }, { status: 400 })
  }

  const gt = gameType === 'classic' ? 'Classic' : 'Showdown Captain Mode'

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contestsResponse = await fetch(
    `https://www.draftkings.com/lobby/getcontests?sport=${sport}`,
  )
  const contests: DkContestsResponseDTO = await contestsResponse.json()

  const groupIdList: number[] = []
  contests['Contests'].forEach((contest: DkContestDTO) => {
    if (!groupIdList.includes(contest['dg']) && contest['gameType'] === gt) {
      groupIdList.push(contest['dg'])
    }
  })

  const { data: existingSlates } = await supabase
    .from('user_slates')
    .select('dk_draft_group_id')
    .eq('user_id', user.id)

  const existingIds = new Set(existingSlates?.map(s => s.dk_draft_group_id) ?? [])

  const newGroupIds = groupIdList.filter(id => !existingIds.has(id))

  const slates: DkSlateDTO[] = await Promise.all(
    newGroupIds.map(async id => {
      const res = await fetch(`https://api.draftkings.com/draftgroups/v1/${id}`)
      return (await res.json()) as DkSlateDTO
    }),
  )

  return NextResponse.json(slates)
}
