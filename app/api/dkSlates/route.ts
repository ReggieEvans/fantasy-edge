// @desc    Get Available DkSlates
// @route   GET /api/dkSlates
import { NextResponse } from 'next/server'

import { DkContestDTO, DkContestsResponseDTO } from '@/app/(protected)/cfb/slate-manager/_dto/dkContests.dto'
import { DkSlateDTO } from '@/app/(protected)/cfb/slate-manager/_dto/dkSlate.dto'
import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async () => {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all DK contest by sport
  const contestsResponse = await fetch('https://www.draftkings.com/lobby/getcontests?sport=CFB')
  const contests: DkContestsResponseDTO = await contestsResponse.json()

  // Get all slateIds (groupIds) by gameType
  const groupIdList: number[] = []
  contests['Contests'].forEach((contest: DkContestDTO) => {
    if (!groupIdList.includes(contest['dg']) && contest['gameType'] === 'Classic') {
      groupIdList.push(contest['dg'])
    }
  })

  // Get all DK group IDs the user already has
  const { data: existingSlates } = await supabase.from('user_slates').select('dk_draft_group_id').eq('user_id', user.id)

  const existingIds = new Set(existingSlates?.map(s => s.dk_draft_group_id) ?? [])

  //Only fetch slates the user doesn’t already have
  const newGroupIds = groupIdList.filter(id => !existingIds.has(id))

  const slates: DkSlateDTO[] = await Promise.all(
    newGroupIds.map(async id => {
      const res = await fetch(`https://api.draftkings.com/draftgroups/v1/${id}`)
      return (await res.json()) as DkSlateDTO
    }),
  )

  return NextResponse.json(slates)
}
