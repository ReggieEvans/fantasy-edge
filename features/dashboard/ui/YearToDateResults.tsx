import { useMemo } from 'react'

import { useGetContestEntriesQuery } from '@/features/bankroll-tracker/api/contests.api'
import { useBankrollFilters, useChartData } from '@/features/bankroll-tracker/hooks/hooks'

import MiniProfitChart from './MiniProfitChart'

export default function YearToDateResults({ sport }: { sport: 'NFL' | 'CFB' }) {
  const { data: contestEntries, isLoading } = useGetContestEntriesQuery()

  const rows = useMemo(() => contestEntries?.rows ?? [], [contestEntries])
  const baseRows = useMemo(() => rows.filter(r => r.sport === 'NFL' || r.sport === 'CFB'), [rows])

  const seasons = useMemo(
    () =>
      Array.from(new Set(baseRows.map(r => r.season)))
        .filter(Boolean)
        .sort()
        .reverse() as string[],
    [baseRows],
  )

  const filtered = useBankrollFilters(baseRows, {
    season: seasons[0],
    timePreset: 'season',
    modes: ['Classic', 'Showdown'],
    buckets: ['Sm SE', 'Lg SE', 'Sm 20 Max', 'Lg 20 Max', 'Harris'],
    sports: [sport],
  })
  const { chartData, seriesKeys } = useChartData(filtered, 'mode')

  return (
    <div className=" bg-background-secondary rounded border border-muted-bg h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-accent">
        <h2 className="text-lg font-bold text-foreground ">Year to Date Results</h2>
      </div>
      <MiniProfitChart data={chartData} seriesKeys={seriesKeys} isLoading={isLoading} />
    </div>
  )
}
