import { SupabaseClient } from '@supabase/supabase-js'

import { DkSlateSelection } from '@/app/(protected)/slate-manager/_types/dkSlate'
import { getMarket, impliedTotals, norm, parseAbbrs, pickBook } from '@/libs/utils'
import { OddsGame } from '@/types/odds'

const CFB_ODDS_API = `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=spreads,totals&oddsFormat=american`
const NFL_ODDS_API = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=spreads,totals&oddsFormat=american`

export async function buildSlateMatchups(
  supabase: SupabaseClient,
  slate: { id: string },
  slateSelection: DkSlateSelection,
) {
  try {
    const contestRes = await fetch(`https://api.draftkings.com/draftgroups/v1/${slateSelection.draftGroupId}`)
    const contest = await contestRes.json()
    const games = contest.draftGroup.games

    const { data: teams, error: teamErr } = await supabase.from('cfb_team_flat').select('*')
    if (teamErr || !teams) throw new Error(`Failed to fetch teams: ${teamErr?.message}`)

    const oddsRes = await fetch(slateSelection.sport === 'NFL' ? NFL_ODDS_API : CFB_ODDS_API)
    const odds: OddsGame[] = await oddsRes.json()

    const teamByDkAbbr = new Map(teams.map(t => [t.draftkings_abbreviation.toUpperCase(), t]))
    const oddsByMatch = new Map(odds.map(o => [`${norm(o.home_team)}__${norm(o.away_team)}`, o]))

    const matchupRows = []

    for (const g of games) {
      const abbrs = parseAbbrs(g.description)
      if (!abbrs) {
        console.log('Skipping game, could not parse abbrs:', g.description)
        continue
      }

      const home = teamByDkAbbr.get(abbrs.home)
      const away = teamByDkAbbr.get(abbrs.away)
      if (!home || !away) {
        console.log('Skipping game, missing team mapping:', {
          home: abbrs.home,
          homeFound: !!home,
          away: abbrs.away,
          awayFound: !!away,
        })
        continue
      }

      const oddsKey = `${norm(home.full_name)}__${norm(away.full_name)}`
      const og = oddsByMatch.get(oddsKey)
      let home_team_spread = null,
        away_team_spread = null,
        game_total = null,
        home_team_total = null,
        away_team_total = null

      if (og) {
        const book = pickBook(og)
        if (book) {
          const spreads = getMarket(book, 'spreads')
          const totals = getMarket(book, 'totals')

          const homeOutcome = spreads?.outcomes?.find(o => norm(o.name) === norm(home.full_name))
          const awayOutcome = spreads?.outcomes?.find(o => norm(o.name) === norm(away.full_name))

          if (homeOutcome) home_team_spread = homeOutcome.point
          if (awayOutcome) away_team_spread = awayOutcome.point
          if (home_team_spread == null && away_team_spread != null) home_team_spread = -away_team_spread
          if (away_team_spread == null && home_team_spread != null) away_team_spread = -home_team_spread

          if (totals?.outcomes?.length) game_total = totals.outcomes[0]?.point ?? null

          if (game_total != null) {
            const totalsCalc = impliedTotals(game_total, home_team_spread ?? 0, away_team_spread ?? 0)
            home_team_total = Number(totalsCalc.home_total.toFixed(2))
            away_team_total = Number(totalsCalc.away_total.toFixed(2))
          }
        }
      }
      console.log(home, away)
      matchupRows.push({
        slate_id: slate.id,
        sport: slateSelection.sport,
        start_time: g.startDate,
        name: g.description,
        venue: g.location ?? null,
        tv_network: g.gameAttributes?.[g.gameAttributes.length - 1]?.value ?? null,

        home_team_id: home.id,
        home_team_name: home.mascot,
        home_team_abbr: home.abbreviation,
        home_team_city: home.school,
        home_team_logo: home.logos?.[1] ?? null,

        away_team_id: away.id,
        away_team_name: away.mascot,
        away_team_abbr: away.abbreviation,
        away_team_city: away.school,
        away_team_logo: away.logos?.[1] ?? null,

        home_team_spread,
        away_team_spread,
        home_team_total,
        away_team_total,
        game_total,
      })
    }

    const { error: insertError } = await supabase.from('slate_matchups').insert(matchupRows)
    if (insertError) throw new Error(`Failed to insert matchups: ${insertError.message}`)

    return true
  } catch (err) {
    console.error('❌ buildSlateMatchups failed:', err)
    return false
  }
}
