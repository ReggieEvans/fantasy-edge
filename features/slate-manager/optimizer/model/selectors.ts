import { createSelector } from '@reduxjs/toolkit'

import { optimizerApi } from '../api/optimizer.api'

// pull server list (don’t duplicate in Redux)
const selectSlatePack = (slateId: string, gameType: string) =>
  optimizerApi.endpoints.getSlatePack.select({ id: slateId, gameType })
const selectUI = (s: any) => s.optimizerFilters
const selectPool = (s: any) => s.optimizerPool

// Annotate each player with isExcluded (pool-driven)
export const selectPlayersWithFlags = (slateId: string, gameType: string) =>
  createSelector([selectSlatePack(slateId, gameType), selectPool], (srv, pool) => {
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
export const makeSelectVisiblePlayers = (slateId: string, gameType: string) =>
  createSelector([selectPlayersWithFlags(slateId, gameType), selectUI], (players, ui) => {
    const isShowdownGame = typeof gameType === 'string' && /(showdown|captain)/i.test(gameType)

    const norm = (v: any) => (v ?? '').toString().trim().toUpperCase()
    const isCaptain = (p: any) => {
      const sp = norm(p?.showdown_position)
      return sp === 'CPT' || sp === 'CAPTAIN'
    }
    const isDst = (p: any) => {
      const pos = norm(p?.position)
      return pos === 'DST' || pos === 'D/ST' || pos === 'DEF'
    }

    let rows = players

    // POSITION FILTER
    const uiPos = norm(ui?.position)
    if (uiPos && uiPos !== 'ALL') {
      if (isShowdownGame) {
        if (uiPos === 'CPT') {
          // CPT = showdown_position only
          rows = rows.filter(p => isCaptain(p))
        } else if (uiPos === 'FLEX') {
          // FLEX = non-captain showdown rows (any on-field position)
          rows = rows.filter(p => !isCaptain(p))
        } else {
          // On-field positions (QB/RB/WR/TE/DST): match p.position and exclude captains
          rows = rows.filter(p => {
            if (isCaptain(p)) return false
            const ppos = norm(p?.position)
            return uiPos === 'DST' ? isDst(p) : ppos === uiPos
          })
        }
      } else {
        // Classic behavior (no showdown fields)
        rows = rows.filter(p => {
          const ppos = norm(p?.position)
          return uiPos === 'DST' ? isDst(p) : ppos === uiPos
        })
      }
    }

    // SEARCH
    const q = ui?.search?.trim().toLowerCase() || ''
    if (q) rows = rows.filter(p => p.full_name.toLowerCase().includes(q))

    // HIDE EXCLUDED
    if (ui?.hideExcludedInTable) rows = rows.filter(p => !p.isExcluded)

    return rows
  })

// What the OPTIMIZER uses (pool filters ONLY)
export const makeSelectEligiblePlayers = (slateId: string, gameType: string) =>
  createSelector([selectPlayersWithFlags(slateId, gameType)], players => {
    return players.filter(p => !p.isExcluded)
  })

export const makeSelectExcludedPlayerCount = (slateId: string, gameType: string) =>
  createSelector(
    [selectPlayersWithFlags(slateId, gameType)],
    players => players.filter(p => p.isExcluded).length,
  )
