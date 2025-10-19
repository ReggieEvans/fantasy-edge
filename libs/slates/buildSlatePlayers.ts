/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js'

import { DkSlateSelection } from '@/features/slate-manager/_types/dkSlate'

export async function buildSlatePlayers(
  supabase: SupabaseClient,
  slate: { id: string },
  slateSelection: DkSlateSelection,
) {
  try {
    const draftablesRes = await fetch(
      `https://api.draftkings.com/draftgroups/v1/draftgroups/${slateSelection.draftGroupId}/draftables`,
    )
    const draftables = await draftablesRes.json()
    const players = draftables.draftables

    const isShowdown = slateSelection.gameType === 'showdown'

    const { data: teams, error: teamErr } = await supabase
      .from('cfb_team_flat')
      .select('id, draftkings_abbreviation')
    if (teamErr || !teams) throw new Error(`Failed to fetch teams: ${teamErr.message}`)

    const teamMap = new Map(teams.map(t => [String(t.draftkings_abbreviation).toUpperCase(), t.id]))

    // For Classic: dedup by player_id (keep best row)
    // For Showdown: keep BOTH captain & utility (key by draftable_id)
    const dedupClassic = new Map<number, any>()
    const dedupShowdown = new Map<number, any>() // draftable_id -> row

    for (const p of players) {
      const teamId = teamMap.get(String(p.teamAbbreviation || '').toUpperCase())
      if (!teamId) {
        console.warn(`⚠️ Missing team for ${p.displayName} (${p.teamAbbreviation})`)
        continue
      }

      const slotToPosition: Record<string, string> = {
        '511': 'CPT',
        '512': 'FLEX',
      }
      const showdownPosition = isShowdown ? slotToPosition[p.rosterSlotId] : null
      const avgPoints = p.draftStatAttributes.find((attr: any) => attr.id === 90)?.value ?? null

      const row = {
        slate_id: slate.id,
        player_id: Number(p.playerId),
        draftable_id: Number(p.draftableId),
        first_name: p.firstName ?? null,
        last_name: p.lastName ?? null,
        team_id: teamId,
        position: p.position ?? null, // e.g. "CPT" vs "UTIL" on Showdown
        salary: p.salary ?? null, // (DK usually multiplies CPT salary)
        player_image: p.playerImage160 ?? null,
        avg_points: avgPoints,
        is_showdown: isShowdown,
        showdown_position: showdownPosition,
        status: p.status ?? null,
        news_status: p.newsStatus ?? null,
      }

      if (isShowdown) {
        // Keep every distinct draftable (captain + flex) entry
        dedupShowdown.set(row.draftable_id, row)
      } else {
        // Classic: dedup by player_id (prefer higher salary or non-null position)
        const existing = dedupClassic.get(row.player_id)
        if (!existing) {
          dedupClassic.set(row.player_id, row)
        } else {
          const keepNew =
            (row.salary ?? 0) > (existing.salary ?? 0) || (!!row.position && !existing.position)
          if (keepNew) dedupClassic.set(row.player_id, row)
        }
      }
    }

    const playerRows = isShowdown
      ? Array.from(dedupShowdown.values())
      : Array.from(dedupClassic.values())

    const { error: insertErr } = await supabase.from('slate_players').insert(playerRows)
    if (insertErr) throw new Error(`Failed to insert slate_players: ${insertErr.message}`)

    return true
  } catch (err) {
    console.error('❌ buildSlatePlayers failed:', err)
    return false
  }
}
