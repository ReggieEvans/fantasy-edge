import { SupabaseClient } from "@supabase/supabase-js"

import { DkSlateSelection } from "@/app/(protected)/cfb/slate-manager/_types/dkSlate"

export async function buildSlatePlayers(
  supabase: SupabaseClient,
  slate: { id: string },
  slateSelection: DkSlateSelection
) {
  try {
    const draftablesRes = await fetch(
      `https://api.draftkings.com/draftgroups/v1/draftgroups/${slateSelection.draftGroupId}/draftables`
    )
    const draftables = await draftablesRes.json()
    const players = draftables.draftables

    const { data: teams, error: teamErr } = await supabase.from('cfb_team_flat').select('id, abbreviation')
    if (teamErr || !teams) throw new Error(`Failed to fetch teams: ${teamErr.message}`)

    const teamMap = new Map(teams.map(t => [t.abbreviation.toUpperCase(), t.id]))

    const playerRows = []

    for (const p of players) {
      const teamId = teamMap.get(p.teamAbbreviation?.toUpperCase() || '')

      if (!teamId) {
        console.warn(`⚠️ Missing team for ${p.displayName} (${p.teamAbbreviation})`)
        continue
      }

      playerRows.push({
        slate_id: slate.id,
        player_id: p.playerId,
        draftable_id: p.draftableId,
        first_name: p.firstName ?? null,
        last_name: p.lastName ?? null,
        team_id: teamId,
        position: p.position ?? null,
        salary: p.salary ?? null,
      })
    }

    const { error: insertErr } = await supabase.from('slate_players').insert(playerRows)
    if (insertErr) throw new Error(`Failed to insert slate_players: ${insertErr.message}`)

    return true
  } catch (err) {
    console.error('❌ buildSlatePlayers failed:', err)
    return false
  }
}
