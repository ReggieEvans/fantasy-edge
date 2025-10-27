/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { Cog, Loader } from 'lucide-react'
import { useParams } from 'next/navigation'
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { Skeleton } from '@/components/ui/skeleton'
import { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'
import { makeLineupEnricher } from '@/utils/lineupEnricher'
import { toDraftKingsCsvFromMatchups } from '@/utils/toDraftkingsCsv'

import { useGetSlateQuery } from '../../_api/slates.api'
import { Slate } from '../../_types/slate'
import { useGetSlatePackQuery } from '../api/optimizer.api'
import { exportLineupsToCsv } from '../helpers/exportLineupsToCsv'
import { mapLockedForOptimizer } from '../helpers/mapLockedForOptimizer'
import {
  excludePlayer,
  includePlayer,
  lockPlayer,
  toggleExcludePlayersSubset,
  unlockPlayer,
} from '../model/optimizerPool.slice'
import {
  makeSelectEligiblePlayers,
  makeSelectExcludedPlayerCount,
  makeSelectLockedPlayerCount,
  makeSelectVisiblePlayers,
} from '../model/selectors'
import { ExportLineup, Slot } from '../types'
import { makePlayerColumns } from '../ui/columns'
import { OptimizerErrorBoundary } from '../ui/ErrorBoundary'
import ExposureSummary from '../ui/ExposureSummary'
import GenerateLineups from '../ui/GenerateLineups'
import LineupResults from '../ui/LineupResults'
import OptimizerFilters from '../ui/OptimizerFilters'
import OptimizerOptions from '../ui/OptimizerOptions'
import PlayerTable from '../ui/PlayerTable'

type OptimizedPlayer = {
  name: string
  team?: string
  salary: number
  lineup_position?: string
  positions?: string[]
  fe_player_id: string
  fe: {
    team_image: string
    projection?: number
  }
}

type OptimizedLineup = {
  players: OptimizedPlayer[]
  salary: number
  projection: number
}

type OptimizeResponse = {
  requested: number
  generated: number
  mode: string
  sport: string
  lineups: OptimizedLineup[]
  message?: string
}

const SLOT_PRESETS = {
  'NFL:classic': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'],
  'NFL:showdown': ['CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
  'CFB:classic': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'FLEX', 'SFLX'],
  'CFB:showdown': ['CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
} as const satisfies Record<`${Sport}:${GameType}`, readonly Slot[]>

/* =========================
   Utils
========================= */
const normStr = (v: unknown): string => (v ?? '').toString().trim()
const normUpper = (v: unknown): string => normStr(v).toUpperCase()

const isShowdownMode = (gameType?: string): boolean =>
  typeof gameType === 'string' && /(showdown|captain)/i.test(gameType)

const isCaptain = (p: unknown): boolean =>
  (p as { showdown_position?: string }).showdown_position === 'CPT'

const isDst = (p: unknown): boolean => (p as { position?: string }).position === 'DST'

function groupsForPos(pos: string, showdown: boolean) {
  const p = (pos ?? 'ALL').toUpperCase()
  return {
    core: true,
    passing: p === 'QB' || p === 'ALL',
    rushing: p === 'RB' || p === 'ALL',
    receiving: p === 'WR' || p === 'TE' || p === 'ALL',
    showdown: showdown && (p === 'ALL' || p === 'CPT' || p === 'FLEX'),
  }
}

function computeVisibility(
  columns: ColumnDef<any, any>[],
  allowed: Record<string, boolean>,
): VisibilityState {
  const vis: VisibilityState = {}

  const walk = (cols: ColumnDef<any, any>[]) => {
    for (const c of cols) {
      const anyC = c as any
      if (anyC.columns) {
        walk(anyC.columns)
      } else {
        const id = c.id as string | undefined
        if (!id) continue
        const meta = (c.meta ?? {}) as { group?: string; groups?: string[] }
        const tags = meta.groups ?? (meta.group ? [meta.group] : ['core'])
        const show = tags.some(t => allowed[t] !== false)
        vis[id] = show
      }
    }
  }

  walk(columns)
  return vis
}

export default function OptimizerPage() {
  const { id } = useParams() as { id: string }

  const { data: slate, isLoading: slateLoading, isFetching: slateFetching } = useGetSlateQuery(id)

  const lineupsRef = useRef<HTMLDivElement | null>(null)

  const {
    data: slatePack = { players: [], matchups: [], positionsArray: [] },
    isLoading: slatePackLoading,
    isFetching: slatePackFetching,
  } = useGetSlatePackQuery(slate?.game_type ? { id, gameType: slate.game_type } : skipArg(), {
    skip: !slate?.game_type,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  })

  const [isBusy, setBusy] = useState(false)
  const [isExporting, setExporting] = useState(false)
  const [expSearch, setExpSearch] = useState('')

  const [response, setResponse] = useState<OptimizeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (response) {
      lineupsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [response])

  const selectVisible = useMemo(
    () => makeSelectVisiblePlayers(id, slate?.game_type ?? ''),
    [id, slate?.game_type],
  )
  const tableRows = useAppSelector(selectVisible)

  const selectEligible = useMemo(
    () => makeSelectEligiblePlayers(id, slate?.game_type ?? ''),
    [id, slate?.game_type],
  )
  const eligiblePlayers = useAppSelector(selectEligible)

  const position = useAppSelector(s => s.optimizerFilters.position)
  const excludedPlayerIds = useAppSelector(s => s.optimizerPool.excludedPlayerIds)
  const constraints = useAppSelector(s => s.optimizerConstraints.constraints)
  const dispatch = useAppDispatch()

  const isAllExcluded = useMemo(() => {
    const excludedSet = new Set(excludedPlayerIds.map(String))
    return (
      slatePack.players.length > 0 && slatePack.players.every(p => excludedSet.has(String(p.id)))
    )
  }, [excludedPlayerIds, slatePack.players])

  const onToggleExclude = useCallback(
    (playerId: string, isCurrentlyExcluded: boolean) => {
      dispatch(isCurrentlyExcluded ? includePlayer(playerId) : excludePlayer(playerId))
    },
    [dispatch],
  )

  const onToggleLock = useCallback(
    (playerId: string, isCurrentlyLocked: boolean) => {
      dispatch(isCurrentlyLocked ? unlockPlayer(playerId) : lockPlayer(playerId))
    },
    [dispatch],
  )

  const onExcludePlayersSubsetCb = useCallback(() => {
    const gameType = slate?.game_type
    const showdown = isShowdownMode(gameType)
    const uiPos = normUpper(position)

    let ids: string[]
    if (uiPos === 'ALL') {
      ids = slatePack.players.map(p => String(p.id))
    } else if (showdown && uiPos === 'CPT') {
      ids = slatePack.players.filter(isCaptain).map(p => String(p.id))
    } else if (showdown && uiPos === 'FLEX') {
      ids = slatePack.players.filter(p => !isCaptain(p)).map(p => String(p.id))
    } else {
      ids = slatePack.players
        .filter(p => {
          if (showdown && isCaptain(p)) return false
          return uiPos === 'DST' ? isDst(p) : normUpper(p.position) === uiPos
        })
        .map(p => String(p.id))
    }

    startTransition(() => {
      dispatch(toggleExcludePlayersSubset(ids))
    })
  }, [dispatch, position, slate?.game_type, slatePack.players])

  const playerColumns = useMemo(
    () =>
      makePlayerColumns({
        onToggleExclude,
        onToggleLock,
        onToggleExcludePlayersSubset: onExcludePlayersSubsetCb,
        isAllExcluded,
      }),
    [onToggleExclude, onToggleLock, onExcludePlayersSubsetCb, isAllExcluded],
  )

  const showdown = isShowdownMode(slate?.game_type)

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  function shallowEqualVisibility(a: VisibilityState, b: VisibilityState) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    for (const k of aKeys) if (a[k] !== b[k]) return false
    return true
  }

  useEffect(() => {
    const allowed = groupsForPos(position, showdown)
    setColumnVisibility(prev => {
      const next = computeVisibility(playerColumns as any[], allowed)
      return shallowEqualVisibility(prev, next) ? prev : next
    })
  }, [playerColumns, position, showdown])

  const selectExcludedCount = useMemo(
    () => makeSelectExcludedPlayerCount(id, slate?.game_type ?? ''),
    [id, slate?.game_type],
  )

  const selectLockedCount = useMemo(
    () => makeSelectLockedPlayerCount(id, slate?.game_type ?? ''),
    [id, slate?.game_type],
  )

  const excludedCount = useAppSelector(selectExcludedCount)
  const lockedCount = useAppSelector(selectLockedCount)

  const lockedPlayerIds = useSelector((s: RootState) => s.optimizerPool.lockedPlayerIds)

  const onGenerateLineups = useCallback(
    async (lineups: number): Promise<void> => {
      if (!slate) return

      const matchups = slatePack.matchups
      const slateType =
        slate.contest_type_id === 94 || slate.contest_type_id === 21 ? 'Classic' : 'Showdown'
      const showdown = slateType === 'Showdown'

      const enrich = makeLineupEnricher(eligiblePlayers, matchups, {
        salaryTolerance: 300,
        debug: true,
        nameAliases: {
          'cj bailey': ['c j bailey', 'christopher bailey', 'christopher j bailey'],
        },
      })

      const csv = toDraftKingsCsvFromMatchups(eligiblePlayers, matchups, slate.sport, showdown, {
        fallbackStartIso: slate.min_start_time,
      })

      const csvBlob = new Blob([csv], { type: 'text/csv' })
      const csvFile = new File([csvBlob], 'draftkings_players.csv', { type: 'text/csv' })

      try {
        setBusy(true)

        const { lockedPlayer } = mapLockedForOptimizer(lockedPlayerIds, eligiblePlayers)

        const constraintsOut = {
          ...constraints,
          locks: lockedPlayer,
        }

        const form = new FormData()
        form.append('sport', slate.sport)
        form.append('mode', slateType.toLowerCase())
        form.append('n_lineups', String(lineups))
        form.append('constraints_json', JSON.stringify(constraintsOut))
        form.append('file', csvFile, 'draftkings_players.csv')

        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_URL}/optimize_upload`, {
          method: 'POST',
          body: form,
        })

        const data: OptimizeResponse | { detail?: string } = await res.json()
        if (!res.ok) {
          setError(('detail' in data && data.detail) || 'Request failed')
          return
        }

        const ok = data as OptimizeResponse
        const enriched = enrich(ok.lineups as any)
        setResponse({ ...ok, lineups: enriched as any })
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [constraints, eligiblePlayers, slate, slatePack.matchups, lockedPlayerIds],
  )

  type PlayerKey = string
  type PlayerExposure = {
    key: PlayerKey
    name: string
    team?: string
    pos?: string
    count: number
    exposurePct: number
    avgSalary?: number
  }
  type TeamExposure = { team: string; count: number; exposurePct: number }

  const { playerExposures, teamExposures } = useMemo(() => {
    if (!response?.lineups?.length || !response.generated) {
      return { playerExposures: [] as PlayerExposure[], teamExposures: [] as TeamExposure[] }
    }

    const countMap = new Map<
      PlayerKey,
      { name: string; team?: string; pos?: string; count: number; salarySum: number }
    >()
    const teamMap = new Map<string, number>()
    const total = response.generated

    for (const lu of response.lineups) {
      const seenTeams = new Set<string>()
      for (const p of lu.players) {
        const name = p.name || 'Unknown'
        const team = p.team || undefined
        const pos =
          p.lineup_position || (Array.isArray(p.positions) ? p.positions.join('/') : undefined)
        const key = `${name}|${team ?? ''}|${pos ?? ''}`

        const prev = countMap.get(key) ?? { name, team, pos, count: 0, salarySum: 0 }
        prev.count += 1
        if (typeof p.salary === 'number') prev.salarySum += p.salary
        countMap.set(key, prev)

        if (team && !seenTeams.has(team)) {
          teamMap.set(team, (teamMap.get(team) ?? 0) + 1)
          seenTeams.add(team)
        }
      }
    }

    const playerExposures: PlayerExposure[] = Array.from(countMap.entries()).map(([key, v]) => ({
      key,
      name: v.name,
      team: v.team,
      pos: v.pos,
      count: v.count,
      exposurePct: (v.count / total) * 100,
      avgSalary: v.count ? Math.round(v.salarySum / v.count) : undefined,
    }))

    playerExposures.sort(
      (a, b) => b.exposurePct - a.exposurePct || b.count - a.count || a.name.localeCompare(b.name),
    )

    const teamExposures: TeamExposure[] = Array.from(teamMap.entries())
      .map(([team, c]) => ({ team, count: c, exposurePct: (c / total) * 100 }))
      .sort((a, b) => b.exposurePct - a.exposurePct || a.team.localeCompare(b.team))

    return { playerExposures, teamExposures }
  }, [response?.generated, response?.lineups])

  const filteredPlayerExposures = useMemo(() => {
    if (!expSearch) return playerExposures
    const q = expSearch.toLowerCase()
    return playerExposures.filter(pe =>
      [pe.name, pe.team ?? '', pe.pos ?? ''].some(x => x.toLowerCase().includes(q)),
    )
  }, [playerExposures, expSearch])

  const onExportLineups = useCallback(() => {
    if (!slate || !response?.lineups) return

    const sport = slate.sport as Sport
    const mode =
      slate.contest_type_id === 94 || slate.contest_type_id === 21 ? 'classic' : 'showdown'

    const key = `${sport}:${mode}` as const
    const slotOrder = SLOT_PRESETS[key as keyof typeof SLOT_PRESETS]

    setExporting(true)
    exportLineupsToCsv(response.lineups as unknown as ExportLineup[], {
      slotOrder,
      filename: `${sport}-${mode}-lineups.csv`,
    })
    setExporting(false)
  }, [response?.lineups, slate])

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <Cog size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Lineup Optimizer</h1>
          </div>
          <p className="text-muted text-sm">
            FantasyEdge Optimizer helps you optimize lineups for DraftKings. Build your pool, set
            constraints, and generate lineups.
          </p>
        </div>
      </div>

      <section className="flex flex-col px-6 pb-8">
        <OptimizerErrorBoundary>
          <OptimizerOptions slate={slate as Slate | undefined} matchups={slatePack.matchups} />
        </OptimizerErrorBoundary>

        <OptimizerErrorBoundary>
          <OptimizerFilters
            slate={slate as Slate | undefined}
            positionsArray={slatePack.positionsArray}
            excludedCount={excludedCount}
            lockedCount={lockedCount}
          />
        </OptimizerErrorBoundary>

        <OptimizerErrorBoundary>
          {slatePackLoading || slatePackFetching || slateLoading || slateFetching ? (
            <div className="flex flex-col gap-1 justify-center items-center h-full">
              <Skeleton className="h-10 w-full animate-pulse rounded bg-card" />
              <Skeleton className="h-8 w-full animate-pulse rounded bg-card" />
              <Skeleton className="h-[800px] w-full animate-pulse rounded bg-card">
                <div className="flex flex-col gap-1 justify-center items-center h-full p-4">
                  <span>
                    <Loader className="w-6 h-6 animate-spin text-accent" />
                  </span>
                  <p className="text-muted uppercase font-black text-sm mt-2">
                    Loading player table...
                  </p>
                </div>
              </Skeleton>
            </div>
          ) : (
            <PlayerTable
              columns={playerColumns as any}
              data={tableRows}
              isLoading={slatePackLoading}
              isFetching={slatePackFetching}
              initialPageSize={100}
              getRowId={p => String((p as { id: string | number }).id)}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          )}
        </OptimizerErrorBoundary>

        <OptimizerErrorBoundary>
          <GenerateLineups
            onGenerateLineups={onGenerateLineups}
            isBusy={isBusy}
            isExporting={isExporting}
            onExportLineups={onExportLineups}
            lineups={response?.lineups ?? []}
          />
        </OptimizerErrorBoundary>

        {response && (
          <OptimizerErrorBoundary>
            <div ref={lineupsRef} id="lineups" className="scroll-mt-[96px]">
              <div className="flex gap-6">
                <div className="w-[400px]">
                  <ExposureSummary
                    expSearch={expSearch}
                    setExpSearch={setExpSearch}
                    playerExposures={filteredPlayerExposures}
                    teamExposures={teamExposures}
                  />
                </div>
                <div className="flex-1">
                  <LineupResults lineups={response.lineups} error={error} />
                </div>
              </div>
            </div>
          </OptimizerErrorBoundary>
        )}
      </section>
    </div>
  )
}

function skipArg(): { id: string; gameType: string } {
  return { id: '', gameType: '' }
}
