'use client'

import { Cog, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { useGetSlateQuery } from '@/app/(protected)/slate-manager/_api/slates.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { makeLineupEnricher } from '@/utils/lineupEnricher'
import { toDraftKingsCsv, toDraftKingsCsvFromMatchups } from '@/utils/toDraftkingsCsv'

import { useGetMatchupsQuery } from '../../_api/matchups.api'
import { useGetSlatePackQuery } from '../../_api/optimizer'
import {
  excludeAllPlayers,
  excludePlayer,
  includePlayer,
  lockPlayer,
  toggleExcludeAllPlayers,
  unlockPlayer,
} from '../../_state/optimizerPool.slice'
import {
  makeSelectEligiblePlayers,
  makeSelectExcludedPlayerCount,
  makeSelectFilteredPlayers,
  makeSelectVisiblePlayers,
} from '../../_state/selectors'
import { Player } from '../../_types/player'
import { makePlayerColumns } from './components/columns'
import ExcludeAllModal from './components/ExcludeAllModal'
import ExposureSummary from './components/ExposureSummary'
import GenerateLineups from './components/GenerateLineups'
import LineupResults from './components/LineupResults'
import FantasyEdgeOptimizer from './components/OLD_FantasyEdgeOptimizer'
import PlayerPool from './components/OLD_PlayerPool'
import OptimizerFilters from './components/OptimizerFilters'
import OptimizerOptions from './components/OptimizerOptions'
import PlayerTable from './components/PlayerTable'

export default function OptimizerPage() {
  const { id } = useParams() as { id: string }
  const { data: slate, isLoading, isError } = useGetSlateQuery(id)
  const {
    data: slatePack = { players: [], matchups: [], positionsArray: [] },
    isLoading: slatePackLoading,
    isError: slatePackError,
  } = useGetSlatePackQuery(id)
  const [isBusy, setBusy] = useState(false)
  const [expSearch, setExpSearch] = useState('')
  const [excludeAllOpen, setExcludeAllOpen] = useState(false)

  const [response, setResponse] = useState<null | {
    requested: number
    generated: number
    mode: string
    sport: string
    lineups: any[]
    message?: string
  }>(null)
  const [error, setError] = useState<string | null>(null)

  const selectVisible = useMemo(() => makeSelectVisiblePlayers(id), [id])
  const tableRows = useAppSelector(selectVisible)
  const selectEligible = useMemo(() => makeSelectEligiblePlayers(id), [id])
  const eligiblePlayers = useAppSelector(selectEligible)
  const excludedPlayerIds = useAppSelector(s => s.optimizerPool.excludedPlayerIds)
  const constraints = useAppSelector(s => s.optimizerConstraints.constraints)
  const dispatch = useAppDispatch()

  const isAllExcluded = useMemo(() => {
    const excludedSet = new Set(excludedPlayerIds)
    return slatePack.players.every(p => excludedSet.has(String(p.id)))
  }, [excludedPlayerIds, slatePack.players])

  const playerColumns = useMemo(
    () =>
      makePlayerColumns({
        onToggleExclude: (id, isCurrentlyExcluded) => {
          dispatch(isCurrentlyExcluded ? includePlayer(id) : excludePlayer(id))
        },
        onToggleLock: (id, isCurrentlyLocked) => {
          dispatch(isCurrentlyLocked ? unlockPlayer(id) : lockPlayer(id))
        },
        onToggleExcludeAll: () => {
          setExcludeAllOpen(true)
        },
        isAllExcluded: isAllExcluded,
      }),
    [dispatch, isAllExcluded],
  )

  const selectCount = useMemo(() => makeSelectExcludedPlayerCount(id), [id])
  const excludedCount = useAppSelector(selectCount)

  const onExcludeAllPlayers = () => {
    const allIds = slatePack.players.map(p => p.id)
    dispatch(toggleExcludeAllPlayers(allIds))
    setExcludeAllOpen(false)
  }

  const onGenerateLineups = async (lineups: number) => {
    if (!slate) return

    // matchups: your slatePack.matchups (array with away/home ids + abbrs)
    const matchups = slatePack.matchups
    const slateType = slate?.contest_type_id === 94 ? 'Classic' : 'Showdown'

    const enrich = makeLineupEnricher(eligiblePlayers, slatePack.matchups, {
      salaryTolerance: 300, // bump if needed
      debug: true,
      nameAliases: {
        // optional nickname/initial fixes
        'cj bailey': ['c j bailey', 'christopher bailey', 'christopher j bailey'],
      },
    })

    const csv = toDraftKingsCsvFromMatchups(eligiblePlayers, matchups, {
      fallbackStartIso: slate?.min_start_time, // optional
      avgPointsKey: 'projection',
    })

    // 2) Turn it into a File (best) or Blob (fallback)
    const csvBlob = new Blob([csv], { type: 'text/csv' })
    // If your TS/lib supports File:
    const csvFile = new File([csvBlob], 'draftkings_players.csv', { type: 'text/csv' })

    const sport = slate.sport
    const mode = slateType.toLowerCase()
    const nLineups = lineups
    const constraintsObject = constraints

    try {
      setBusy(true)
      // 3) Build FormData (DON'T set Content-Type manually)
      const form = new FormData()
      form.append('sport', sport) // e.g. 'CFB'
      form.append('mode', mode) // e.g. 'classic'
      form.append('n_lineups', String(nLineups))
      form.append('constraints_json', JSON.stringify(constraintsObject))
      form.append('file', csvFile, 'draftkings_players.csv') // <- key the server expects

      const res = await fetch(`http://localhost:8006/optimize_upload`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.detail || 'Request failed')
      } else {
        const enriched = enrich(data.lineups)
        // Keep your response shape but with richer per-player info:
        setResponse({ ...data, lineups: enriched })
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  // =========================
  // Exposure calculations
  // =========================
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

  const { playerExposures, teamExposures, totalLineups } = useMemo(() => {
    const map = new Map<PlayerKey, { name: string; team?: string; pos?: string; count: number; salarySum: number }>()
    const teamMap = new Map<string, number>()

    const n = response?.generated ?? 0
    const lineups = response?.lineups ?? []

    for (const lu of lineups) {
      const seenTeams = new Set<string>()
      for (const p of lu.players ?? []) {
        const name: string = p.name || 'Unknown'
        const team: string | undefined = p.team || undefined
        const pos: string | undefined =
          p.lineup_position || (Array.isArray(p.positions) ? p.positions.join('/') : undefined)
        const key = `${name}|${team ?? ''}|${pos ?? ''}`

        const rec = map.get(key) ?? { name, team, pos, count: 0, salarySum: 0 }
        rec.count += 1
        if (typeof p.salary === 'number') rec.salarySum += p.salary
        map.set(key, rec)

        if (team && !seenTeams.has(team)) {
          teamMap.set(team, (teamMap.get(team) ?? 0) + 1)
          seenTeams.add(team)
        }
      }
    }

    const playerExposures: PlayerExposure[] = Array.from(map.entries()).map(([key, v]) => ({
      key,
      name: v.name,
      team: v.team,
      pos: v.pos,
      count: v.count,
      exposurePct: n ? (v.count / n) * 100 : 0,
      avgSalary: v.count ? Math.round(v.salarySum / v.count) : undefined,
    }))

    playerExposures.sort((a, b) => b.exposurePct - a.exposurePct || b.count - a.count || a.name.localeCompare(b.name))

    const teamExposures = Array.from(teamMap.entries())
      .map(([team, c]) => ({ team, count: c, exposurePct: n ? (c / n) * 100 : 0 }))
      .sort((a, b) => b.exposurePct - a.exposurePct || a.team.localeCompare(b.team))

    return { playerExposures, teamExposures, totalLineups: n }
  }, [response])

  const filteredPlayerExposures = useMemo(() => {
    if (!expSearch) return playerExposures
    const q = expSearch.toLowerCase()
    return playerExposures.filter(pe => [pe.name, pe.team ?? '', pe.pos ?? ''].some(x => x.toLowerCase().includes(q)))
  }, [playerExposures, expSearch])

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
            FantasyEdge Optimizer is a tool that helps you optimize lineups for draftkings. From here you can optimize
            your lineups, view your player pool, and view your targets.
          </p>
        </div>
      </div>

      <section className="flex flex-col px-6 pb-8">
        <OptimizerOptions slate={slate} matchups={slatePack?.matchups} />
        <OptimizerFilters slate={slate} positionsArray={slatePack?.positionsArray} excludedCount={excludedCount} />
        <PlayerTable columns={playerColumns} data={tableRows} />
        <GenerateLineups onGenerateLineups={onGenerateLineups} isBusy={isBusy} />

        {response && (
          <div className="flex gap-6">
            <div className="w-[500px]">
              <ExposureSummary
                expSearch={expSearch}
                setExpSearch={setExpSearch}
                playerExposures={filteredPlayerExposures}
                teamExposures={teamExposures}
                totalLineups={totalLineups}
              />
            </div>
            <div className="flex-1">
              <LineupResults lineups={response?.lineups ?? null} error={error} />
            </div>
          </div>
        )}
      </section>
      <ExcludeAllModal
        open={excludeAllOpen}
        onClose={() => setExcludeAllOpen(false)}
        onExcludeAll={() => {
          onExcludeAllPlayers()
        }}
        isAllExcluded={isAllExcluded}
      />
    </div>
  )
}
