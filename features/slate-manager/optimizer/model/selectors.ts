// features/optimizer/model/selectors.ts
import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

import { optimizerApi } from '../api/optimizer.api'

/* =========================
   Domain types (minimal, extend as needed)
========================= */
type PositionCode = 'QB' | 'RB' | 'WR' | 'TE' | 'DST' | 'D/ST' | 'DEF' | 'FLEX' | string
type ShowdownPosition = 'CPT' | 'CAPTAIN' | 'FLEX' | '' | string

export type PackPlayer = {
  id?: string | number
  fe_player_id?: string
  player_id?: string | number
  draftable_id?: string | number

  full_name?: string
  name?: string
  team?: string
  team_id?: string | number

  position?: PositionCode
  showdown_position?: ShowdownPosition | null
  salary?: number
  positions?: string[]
}

export type SlatePack = {
  players: PackPlayer[]
  matchups: unknown[] // not used here
  positionsArray: string[]
}

type OptimizerPoolState = {
  excludedTeamIds: Array<string | number>
  excludedPlayerIds: Array<string | number>
  lockedPlayerIds: Array<string | number>
}

type OptimizerFiltersState = {
  position: string // 'ALL' | 'QB' | 'RB' | ... | 'CPT' | 'FLEX'
  search?: string
  hideExcludedInTable?: boolean
}

/** The row shape your table expects (id required + flags). */
export type PlayerRow = PackPlayer & {
  id: string
  isExcluded: boolean
  isLocked: boolean
}

/* =========================
   Local helpers
========================= */
const norm = (v: unknown): string => (v ?? '').toString().trim()
const normUpper = (v: unknown): string => norm(v).toUpperCase()

const isShowdownGame = (gameType: string): boolean => /(showdown|captain)/i.test(gameType)

const isCaptain = (p: Pick<PackPlayer, 'showdown_position'>): boolean => {
  const sp = normUpper(p.showdown_position)
  return sp === 'CPT' || sp === 'CAPTAIN'
}

const isDst = (p: Pick<PackPlayer, 'position'>): boolean => {
  const pos = normUpper(p.position)
  return pos === 'DST' || pos === 'D/ST' || pos === 'DEF'
}

/** Build a stable, deterministic id for table rows (no randoms). */
const rowId = (p: PackPlayer): string => {
  if (p.id != null) return String(p.id)
  if (p.fe_player_id) return p.fe_player_id
  if (p.player_id != null) return String(p.player_id)
  if (p.draftable_id != null) return String(p.draftable_id)
  // last-resort composite (deterministic)
  const name = p.full_name ?? p.name ?? 'UNK'
  return `${name}|${p.team ?? ''}|${p.position ?? ''}|${p.team_id ?? ''}`
}

/* =========================
   Base selectors (typed)
========================= */
const selectOptimizerFilters = (s: RootState): OptimizerFiltersState =>
  (s as RootState & { optimizerFilters: OptimizerFiltersState }).optimizerFilters

const selectOptimizerPool = (s: RootState): OptimizerPoolState =>
  (s as RootState & { optimizerPool: OptimizerPoolState }).optimizerPool

/** Narrow the RTK Query select result to just { data?: SlatePack } for typing clarity. */
const selectSlatePackRTK = (slateId: string, gameType: string) => {
  const base = optimizerApi.endpoints.getSlatePack.select({ id: slateId, gameType })
  return (state: RootState): { data?: SlatePack } => {
    const res = base(state) as { data?: SlatePack }
    return { data: res.data }
  }
}

/* =========================
   Derived selectors
========================= */

/** Server list + pool flags → rows with { id, isExcluded, isLocked }. */
export const selectPlayersWithFlags = (slateId: string, gameType: string) =>
  createSelector([selectSlatePackRTK(slateId, gameType), selectOptimizerPool], (srv, pool) => {
    const list: PackPlayer[] = srv.data?.players ?? []

    const excludedTeams = new Set((pool.excludedTeamIds ?? []).map(String))
    const excludedPlayers = new Set((pool.excludedPlayerIds ?? []).map(String))
    const lockedPlayers = new Set((pool.lockedPlayerIds ?? []).map(String))

    const rows: PlayerRow[] = list.map(p => {
      const id = rowId(p)
      const teamId = p.team_id != null ? String(p.team_id) : ''
      const isExcluded =
        (teamId && excludedTeams.has(teamId)) ||
        excludedPlayers.has(String(p.id ?? '')) ||
        excludedPlayers.has(id)

      const isLocked = lockedPlayers.has(String(p.id ?? '')) || lockedPlayers.has(id)

      return {
        ...p,
        id, // normalized to string
        isExcluded,
        isLocked,
      }
    })

    return rows
  })

/** What the TABLE shows (UI filters applied); optionally hides excluded. */
export const makeSelectVisiblePlayers = (slateId: string, gameType: string) =>
  createSelector(
    [selectPlayersWithFlags(slateId, gameType), selectOptimizerFilters],
    (players, ui) => {
      let rows = players
      const uiPos = normUpper(ui.position)
      const showdown = isShowdownGame(gameType)

      // POSITION FILTER
      if (uiPos && uiPos !== 'ALL') {
        if (showdown) {
          if (uiPos === 'CPT') {
            rows = rows.filter(p => isCaptain(p))
          } else if (uiPos === 'FLEX') {
            rows = rows.filter(p => !isCaptain(p))
          } else {
            rows = rows.filter(p => {
              if (isCaptain(p)) return false
              return uiPos === 'DST' ? isDst(p) : normUpper(p.position) === uiPos
            })
          }
        } else {
          rows = rows.filter(p => (uiPos === 'DST' ? isDst(p) : normUpper(p.position) === uiPos))
        }
      }

      // SEARCH
      const q = norm(ui?.search).toLowerCase()
      if (q) {
        rows = rows.filter(p => (p.full_name ?? p.name ?? '').toLowerCase().includes(q))
      }

      // HIDE EXCLUDED
      if (ui?.hideExcludedInTable) rows = rows.filter(p => !p.isExcluded)

      return rows
    },
  )

/** What the OPTIMIZER uses (pool filters ONLY). */
export const makeSelectEligiblePlayers = (slateId: string, gameType: string) =>
  createSelector([selectPlayersWithFlags(slateId, gameType)], players =>
    players.filter(p => !p.isExcluded),
  )

export const makeSelectExcludedPlayerCount = (slateId: string, gameType: string) =>
  createSelector([selectPlayersWithFlags(slateId, gameType)], players =>
    players.reduce((acc, p) => acc + (p.isExcluded ? 1 : 0), 0),
  )
