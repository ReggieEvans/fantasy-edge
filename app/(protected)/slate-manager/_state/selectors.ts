import { createSelector } from '@reduxjs/toolkit'

import { optimizerApi } from '@/app/(protected)/slate-manager/_api/optimizer'

// pull server list (don’t duplicate in Redux)
const selectSlatePack = (slateId: string) => optimizerApi.endpoints.getSlatePack.select(slateId)
const selectUI = (s: any) => s.optimizerFilters
const selectPool = (s: any) => s.optimizerPool

// Annotate each player with isExcluded (pool-driven)
export const selectPlayersWithFlags = (slateId: string) =>
  createSelector([selectSlatePack(slateId), selectPool], (srv, pool) => {
    const list = srv?.data?.players ?? []
    const excludedTeams = new Set((pool.excludedTeamIds ?? []).map(String))
    const excludedPlayers = new Set((pool.excludedPlayerIds ?? []).map(String))
    const lockedPlayers = new Set((pool.lockedPlayerIds ?? []).map(String))

    const players = list.map((p: any) => ({
      ...p,
      isExcluded: excludedTeams.has(String(p.team_id)) || excludedPlayers.has(String(p.id)),
      isLocked: lockedPlayers.has(String(p.id)),
    }))
    return players
  })

// What the TABLE shows (UI filters applied), but keeps excluded rows (optionally hidden)
export const makeSelectVisiblePlayers = (slateId: string) =>
  createSelector([selectPlayersWithFlags(slateId), selectUI], (players, ui) => {
    let rows = players

    if (ui.position !== 'all') rows = rows.filter(p => p.position === ui.position)
    const q = ui.search.trim().toLowerCase()
    if (q) rows = rows.filter(p => p.full_name.toLowerCase().includes(q))

    if (ui.hideExcludedInTable) rows = rows.filter(p => !p.isExcluded)

    return rows
  })

// What the OPTIMIZER uses (pool filters ONLY)
export const makeSelectEligiblePlayers = (slateId: string) =>
  createSelector([selectPlayersWithFlags(slateId)], players => {
    return players.filter(p => !p.isExcluded)
  })

export const makeSelectExcludedPlayerCount = (slateId: string) =>
  createSelector([selectPlayersWithFlags(slateId)], players => players.filter(p => p.isExcluded).length)
