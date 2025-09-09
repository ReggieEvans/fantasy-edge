import { NextResponse } from 'next/server'

import { Player } from '@/app/(protected)/slate-manager/_types/player'
import { PassingStats, ReceivingStats, RushingStats } from '@/app/(protected)/slate-manager/_types/stats'
import { createServerSupabaseClient } from '@/libs/supabase/server'

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const { id: slateId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 1) All matchups for the slate
    const { data: matchups, error: matchupsErr } = await supabase
      .from('slate_matchups')
      .select('*')
      .eq('slate_id', slateId)

    if (matchupsErr) return NextResponse.json({ error: matchupsErr.message }, { status: 500 })
    if (!matchups || matchups.length === 0) {
      return NextResponse.json({ error: 'No matchups found for this slate' }, { status: 404 })
    }

    // Build opponent lookup: team_id -> opponent_team_id
    const opponentByTeamId = new Map<string, string>()
    for (const m of matchups) {
      const home = String(m.home_team_id)
      const away = String(m.away_team_id)
      opponentByTeamId.set(home, away)
      opponentByTeamId.set(away, home)
    }

    const teamImageByTeamId = new Map<string, string>()
    for (const m of matchups) {
      const home = String(m.home_team_id)
      const away = String(m.away_team_id)
      teamImageByTeamId.set(home, m.home_team_logo)
      teamImageByTeamId.set(away, m.away_team_logo)
    }

    // Unique team ids across all matchups
    const teamIds = Array.from(new Set<string>(matchups.flatMap(m => [String(m.home_team_id), String(m.away_team_id)])))

    // 2) All slate players for these teams
    const { data: allPlayers, error: playersErr } = await supabase
      .from('slate_players')
      .select('*')
      .eq('slate_id', slateId)
      .in('team_id', teamIds)

    if (playersErr) return NextResponse.json({ error: playersErr.message }, { status: 500 })
    if (!allPlayers || allPlayers.length === 0) {
      return NextResponse.json({ error: 'No players found for this slate' }, { status: 404 })
    }

    // 3) Per-player summaries
    const [{ data: passingSummary }, { data: rushingSummary }, { data: receivingSummary }] = await Promise.all([
      supabase.from('passing_summary').select('*').in('team_id', teamIds),
      supabase.from('rushing_summary').select('*').in('team_id', teamIds),
      supabase.from('receiving_summary').select('*').in('team_id', teamIds),
    ])

    if (!passingSummary || !rushingSummary || !receivingSummary) {
      return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 })
    }

    // 4) Team-level stats
    const [
      { data: passingRate },
      { data: rushingRate },
      { data: teamPassing },
      { data: teamRushing },
      { data: passingDefense },
      { data: rushingDefense },
    ] = await Promise.all([
      supabase.from('passing_rate').select('*').in('team_id', teamIds),
      supabase.from('rushing_rate').select('*').in('team_id', teamIds),
      supabase.from('team_passing').select('*').in('team_id', teamIds),
      supabase.from('team_rushing').select('*').in('team_id', teamIds),
      supabase.from('passing_defense').select('*').in('team_id', teamIds),
      supabase.from('rushing_defense').select('*').in('team_id', teamIds),
    ])

    if (!passingRate || !rushingRate || !teamPassing || !teamRushing || !passingDefense || !rushingDefense) {
      return NextResponse.json({ error: 'Failed to fetch team stats' }, { status: 500 })
    }

    // 5) Build lookup maps
    const passingStats = new Map(passingSummary.map(stat => [normalizeName(stat.player), stat]))
    const rushingStats = new Map(rushingSummary.map(stat => [normalizeName(stat.player), stat]))
    const receivingStats = new Map(receivingSummary.map(stat => [normalizeName(stat.player), stat]))

    const toTeamMap = <T extends { team_id: string }>(rows: T[] = []) => new Map(rows.map(r => [String(r.team_id), r]))

    const passingRateByTeam = toTeamMap(passingRate)
    const rushingRateByTeam = toTeamMap(rushingRate)
    const teamPassingByTeam = toTeamMap(teamPassing)
    const teamRushingByTeam = toTeamMap(teamRushing)
    const passingDefenseByTeam = toTeamMap(passingDefense)
    const rushingDefenseByTeam = toTeamMap(rushingDefense)

    // 6) Players: dedupe → enrich → attach teamStats (with OPPONENT defense)
    const deduped = dedupePlayers(allPlayers)
    const enriched = enrichPlayers(deduped, {
      passing: passingStats,
      rushing: rushingStats,
      receiving: receivingStats,
    }).map(p => {
      const teamId = String(p.team_id)
      const oppId = opponentByTeamId.get(teamId) ?? null
      const teamImage = teamImageByTeamId.get(teamId) ?? null

      return {
        ...p,
        opponent_team_id: oppId,
        team_image: teamImage,
        teamStats: {
          passingRate: passingRateByTeam.get(teamId) ?? null,
          rushingRate: rushingRateByTeam.get(teamId) ?? null,
          teamPassing: teamPassingByTeam.get(teamId) ?? null,
          teamRushing: teamRushingByTeam.get(teamId) ?? null,
          passingDefense: oppId ? (passingDefenseByTeam.get(oppId) ?? null) : null,
          rushingDefense: oppId ? (rushingDefenseByTeam.get(oppId) ?? null) : null,
        },
      }
    })

    // 7) Filter out players with no passing, rushing, or receiving
    const [players, filteredOut] = partition(
      enriched,
      p => p.position === 'DST' || p.passing != null || p.rushing != null || p.receiving != null,
    )

    const filteredOutCount = filteredOut.length
    const filteredOutPlayers = filteredOut.map(p => `${p.first_name} ${p.last_name} (${p.position ?? 'UNKNOWN'})`)

    // 8) Matchups with team stats
    const teamStatPair = <T extends { team_id: string }>(rows: T[] = [], homeId: string, awayId: string) => ({
      home: rows.find(r => String(r.team_id) === String(homeId)) ?? null,
      away: rows.find(r => String(r.team_id) === String(awayId)) ?? null,
    })

    const matchupsWithTeamStats = matchups.map(m => ({
      ...m,
      passingRate: teamStatPair(passingRate, m.home_team_id, m.away_team_id),
      rushingRate: teamStatPair(rushingRate, m.home_team_id, m.away_team_id),
      teamPassing: teamStatPair(teamPassing, m.home_team_id, m.away_team_id),
      teamRushing: teamStatPair(teamRushing, m.home_team_id, m.away_team_id),
      passingDefense: teamStatPair(passingDefense, m.home_team_id, m.away_team_id),
      rushingDefense: teamStatPair(rushingDefense, m.home_team_id, m.away_team_id),
    }))

    // 9) Projections flag
    const hasAnyProjection = players.some(p => (p as any).projection != null)
    const isMissingProjections = !hasAnyProjection

    const positionsArray = players.reduce((acc, p) => {
      if (acc.includes(p.position)) return acc
      acc.push(p.position)
      return acc
    }, [] as string[])

    const sortedPlayers = players.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0))

    return NextResponse.json(
      {
        players: sortedPlayers,
        matchups: matchupsWithTeamStats,
        isMissingProjections,
        filteredOutCount,
        filteredOutPlayers,
        positionsArray,
      },
      { status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** Helpers */
function normalizeName(name: string) {
  if (!name || typeof name !== 'string') return ''
  return name.toLowerCase().replace(/[^a-z]/g, '')
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

function partition<T>(arr: T[], predicate: (x: T) => boolean): [T[], T[]] {
  const pass: T[] = []
  const fail: T[] = []
  for (const item of arr) {
    if (predicate(item)) pass.push(item)
    else fail.push(item)
  }
  return [pass, fail]
}
