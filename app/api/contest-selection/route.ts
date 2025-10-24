// @desc    Get Available Contests
// @route   GET /api/contest-selection
import { NextRequest, NextResponse } from 'next/server'

import { DkContestsResponseDTO } from '@/features/slate-manager/_dtos/dkContests.dto'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const sport = searchParams.get('sport')

  if (!sport) {
    return NextResponse.json({ error: 'Missing sport or gameType' }, { status: 400 })
  }

  // Get all DK contest by sport
  const contestsResponse = await fetch(
    `https://www.draftkings.com/lobby/getcontests?sport=${sport}`,
  )
  const contests: DkContestsResponseDTO = await contestsResponse.json()

  return NextResponse.json(contests)
}
