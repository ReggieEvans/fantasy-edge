// @desc    Get Matchup by slateId and matchupId
// @route   GET /api/matchups/:id/:matchupId
import { NextResponse } from 'next/server'

import { Player } from '@/app/(protected)/slate-manager/_types/player'
import {
  PassingStats,
  ReceivingStats,
  RushingStats,
} from '@/app/(protected)/slate-manager/_types/stats'
import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; mid: string }> },
) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId, mid } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: matchup } = await supabase
      .from('slate_matchups')
      .select('*')
      .eq('slate_id', slateId)
      .eq('id', mid)
      .single()

    const { home_team_id, away_team_id } = matchup
    const teamIds = [home_team_id, away_team_id]

    const { data: allPlayers } = await supabase
      .from('slate_players')
      .select('*')
      .eq('slate_id', slateId)
      .in('team_id', [home_team_id, away_team_id])

    if (!allPlayers) {
      return NextResponse.json({ error: 'No players found for this matchup' }, { status: 404 })
    }

    const [
      { data: passingSummary },
      { data: rushingSummary },
      { data: receivingSummary },
      { data: passingRate },
      { data: rushingRate },
      { data: teamPassing },
      { data: teamRushing },
      { data: passingDefense },
      { data: rushingDefense },
    ] = await Promise.all([
      supabase.from('passing_summary').select('*').in('team_id', teamIds),
      supabase.from('rushing_summary').select('*').in('team_id', teamIds),
      supabase.from('receiving_summary').select('*').in('team_id', teamIds),
      supabase.from('passing_rate').select('*').in('team_id', teamIds),
      supabase.from('rushing_rate').select('*').in('team_id', teamIds),
      supabase.from('team_passing').select('*').in('team_id', teamIds),
      supabase.from('team_rushing').select('*').in('team_id', teamIds),
      supabase.from('passing_defense').select('*').in('team_id', teamIds),
      supabase.from('rushing_defense').select('*').in('team_id', teamIds),
    ])

    if (
      !passingSummary ||
      !rushingSummary ||
      !receivingSummary ||
      passingSummary.length === 0 ||
      rushingSummary.length === 0 ||
      receivingSummary.length === 0
    ) {
      return NextResponse.json(
        { error: 'Failed to fetch players stats. There are currently no stats for this matchup.' },
        { status: 500 },
      )
    }

    if (
      !passingRate ||
      !rushingRate ||
      !teamPassing ||
      !teamRushing ||
      !passingDefense ||
      !rushingDefense
    ) {
      return NextResponse.json({ error: 'Failed to fetch team stats' }, { status: 500 })
    }

    const homePlayers = dedupePlayers(allPlayers.filter(p => p.team_id === home_team_id))
    const awayPlayers = dedupePlayers(allPlayers.filter(p => p.team_id === away_team_id))

    const passingStats = new Map(passingSummary.map(stat => [normalizeName(stat.player), stat]))
    const rushingStats = new Map(rushingSummary.map(stat => [normalizeName(stat.player), stat]))
    const receivingStats = new Map(receivingSummary.map(stat => [normalizeName(stat.player), stat]))

    const enrichedHome = enrichPlayers(homePlayers, {
      passing: passingStats,
      rushing: rushingStats,
      receiving: receivingStats,
    })

    const enrichedAway = enrichPlayers(awayPlayers, {
      passing: passingStats,
      rushing: rushingStats,
      receiving: receivingStats,
    })

    const homeRoster = groupByPosition(enrichedHome)
    const awayRoster = groupByPosition(enrichedAway)

    const teamStatById = (array: { team_id: string }[] = []) => {
      return {
        home: array.find(row => row.team_id === home_team_id) ?? null,
        away: array.find(row => row.team_id === away_team_id) ?? null,
      }
    }

    return NextResponse.json(
      {
        matchup,
        homeRoster,
        awayRoster,
        passingRate: teamStatById(passingRate),
        rushingRate: teamStatById(rushingRate),
        teamPassing: teamStatById(teamPassing),
        teamRushing: teamStatById(teamRushing),
        passingDefense: teamStatById(passingDefense),
        rushingDefense: teamStatById(rushingDefense),
      },
      { status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function normalizeName(name: string) {
  if (!name || typeof name !== 'string') return ''
  return name.toLowerCase().replace(/[^a-z]/g, '') // strips spaces/punctuation
}

function fullName(player: { first_name: string; last_name: string }) {
  return normalizeName(`${player.first_name}${player.last_name}`)
}

function enrichPlayers(
  players: Player[],
  statMaps: {
    passing: Map<string, PassingStats>
    rushing: Map<string, RushingStats>
    receiving: Map<string, ReceivingStats>
  },
) {
  return players.map(p => {
    const key = fullName(p)

    return {
      ...p,
      passing: statMaps.passing.get(key) || null,
      rushing: statMaps.rushing.get(key) || null,
      receiving: statMaps.receiving.get(key) || null,
    }
  })
}

function groupByPosition(players: Player[]) {
  return players.reduce((acc: { [x: string]: Player[] }, player: Player) => {
    const pos = player.position || 'OTHER'
    acc[pos] = acc[pos] || []
    acc[pos].push(player)
    return acc
  }, {})
}

function dedupePlayers(players: Player[]) {
  const seen = new Set<string>()
  const deduped: Player[] = []

  for (const player of players) {
    const key = `${player.team_id}:${normalizeName(`${player.first_name} ${player.last_name}`)}`

    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(player)
    }
  }

  return deduped
}
