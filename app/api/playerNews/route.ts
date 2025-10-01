// @desc    Get player news
// @route   GET /api/player-news
import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const sport = searchParams.get('sport')

  const sportParam = sport === 'NFL' ? 'nfl' : 'college-football'

  if (!sport) {
    return NextResponse.json({ error: 'Missing sport or gameType' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all DK contest by sport
  const injuriesResponse = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/${sportParam}/injuries`,
  )
  const injuries = await injuriesResponse.json()

  return NextResponse.json(injuries)
}
