import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createServerSupabaseClient } from '@/libs/supabase/server'
import { DkSlate } from '@/types/DkSlate'

const slateSchema = z.object({
  draftGroup: z.object({
    allTags: z.array(z.any()),
    allowUgc: z.boolean().optional(),
    contestType: z.object({
      contestTypeId: z.number(),
      sport: z.string(),
      gameType: z.string(),
      allowLateSwap: z.boolean(),
    }),
    draftGroupId: z.number(),
    draftGroupState: z.string(),
    gameTypeId: z.number(),
    games: z.array(z.any()),
    leagues: z.array(z.any()),
    maxStartTime: z.string(),
    minStartTime: z.string(),
    sportId: z.number(),
    startTimeType: z.string(),
  }),
  games: z.array(z.any()),
  players: z.array(z.any()),
  gameType: z.string(),
  sport: z.string(),
})

type Game = DkSlate['games'][number]

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
    .from('slate_games')
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

  const raw: DkSlate = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, projectionsSubmitted, ...cleaned } = raw
  const parsed = slateSchema.safeParse(cleaned)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid slate format' }, { status: 400 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { draftGroup, players, games, sport, gameType } = parsed.data

  // 1. Insert user_slates
  const { data: slateRow, error: slateError } = await supabase
    .from('user_slates')
    .insert({
      user_id: user.id,
      dk_draft_group_id: draftGroup.draftGroupId,
      sport,
      game_type: gameType,
      min_start_time: draftGroup.minStartTime,
      max_start_time: draftGroup.maxStartTime,
    })
    .select()
    .single()

  if (slateError) {
    console.error('❌ Supabase insert error:', slateError.message)
    return NextResponse.json({ error: 'Failed to insert slate' }, { status: 500 })
  }

  const slateId = slateRow.id
  const teamNames = extractUniqueTeamNames(games)
  const teamIdMap = await getTeamIdMap(teamNames, supabase)

  // 2. Insert slate_games (map teams to team_ids later)
  const gameInserts = parsed.data.games.map(game => ({
    slate_id: slateId,
    game_id: game.competitionId,
    start_time: game.startTime,
    home_team_id: teamIdMap.get(normalizeKey(game.homeTeam.teamName)),
    away_team_id: teamIdMap.get(normalizeKey(game.awayTeam.teamName)),
    home_team_name: game.homeTeam.teamName,
    away_team_name: game.awayTeam.teamName,
    venue: game.venue,
    tv_network: game.broadcast?.network,
    spread: game.odds,
    over_under: game.odds?.total,
  }))

  await supabase.from('slate_games').insert(gameInserts)

  const teamIdToName = new Map<number, string>()
  parsed.data.games.forEach(game => {
    teamIdToName.set(game.homeTeam.teamId, game.homeTeam.teamName)
    teamIdToName.set(game.awayTeam.teamId, game.awayTeam.teamName)
  })

  // 3. Insert slate_players (no team_id mapped yet)
  const playerInserts = players.map(player => {
    const teamName = teamIdToName.get(player.teamId) || 'Unknown'
    return {
      slate_id: slateId,
      player_id: player.draftableId,
      draftable_id: player.draftableId,
      first_name: player.firstName,
      last_name: player.lastName,
      team_id: teamIdMap.get(normalizeKey(teamName)) ?? null,
      team_name: teamName,
      position: player.position,
      salary: player.salary,
      is_starter: true, // or false if needed
      status: '', // or fill if you have it
    }
  })

  await supabase.from('slate_players').insert(playerInserts)

  return NextResponse.json({ success: true, slate_id: slateId }, { status: 201 })
}

function normalizeKey(name: string) {
  return name.trim().toUpperCase()
}

function extractUniqueTeamNames(games: Game[]): string[] {
  const allNames = games.flatMap(game => [game.homeTeam.teamName, game.awayTeam.teamName])

  return [...new Set(allNames.map(name => name.trim()))]
}

async function getTeamIdMap(teamNames: string[], supabase: SupabaseClient) {
  const { data, error } = await supabase.from('teams').select('id, draftkings').in('draftkings', teamNames)

  if (error) throw new Error('Failed to fetch team IDs')

  const map = new Map<string, number>()
  for (const row of data) {
    map.set(normalizeKey(row.draftkings), row.id)
  }

  return map
}

function countBySlate(items: { slate_id: string }[]) {
  return items.reduce(
    (acc, item) => {
      acc[item.slate_id] = (acc[item.slate_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}
