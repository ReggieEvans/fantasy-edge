'use client'

import { Banknote } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import FeatureHeader from '@/shared/ui/FeatureHeader'
import { NoData } from '@/shared/ui/NoData'

import { useDraftKingsCsv } from '../helpers/useDraftkingsCsv'
// prettier-ignore
import { useBankrollFilters, useBiggestWins, useChartData, useGroupedContests, useHeadline, useTopFinishes } from '../hooks/hooks'
import { Bucket } from '../types/bucket'
import { GroupRow, GroupRowWithContests } from '../types/groupRow'
import { Mode } from '../types/mode'
import AllContests from '../ui/AllContests'
import BiggestWins from '../ui/BiggestWins'
import ContestFilter from '../ui/ContestFilter'
import ContestModal from '../ui/ContestModal'
import Headline from '../ui/Headline'
import ProfitChart from '../ui/ProfitChart'
import TopFinishes from '../ui/TopFinishes'

export default function BankrollTrackerPage() {
  const { rows, error, onFile } = useDraftKingsCsv()
  const [file, setFile] = useState<File | null>(null)
  const baseRows = useMemo(() => rows.filter(r => r.sport === 'NFL' || r.sport === 'CFB'), [rows])
  const seasons = useMemo(
    () =>
      Array.from(new Set(baseRows.map(r => r.season)))
        .sort()
        .reverse(),
    [baseRows],
  )
  const [season, setSeason] = useState(seasons[0] || 'all')
  const [timePreset, setTimePreset] = useState<'season' | 'last-3' | 'last-7' | 'last-30' | 'all'>(
    'season',
  )
  const [modes, setModes] = useState<Mode[]>(['Classic'])
  const [buckets, setBuckets] = useState<Bucket[]>(['Cash'])
  const [sports, setSports] = useState<('NFL' | 'CFB')[]>(['NFL'])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<GroupRowWithContests | null>(null)

  useEffect(() => {
    setSeason(seasons[0] || 'all')
  }, [seasons])

  const onSetSelected = (g: GroupRow) => {
    const groupedWithContests = filtered.filter(f => f.contest_key === g.contest_key)
    setSelected({ ...g, contests: groupedWithContests })
  }

  const filtered = useBankrollFilters(baseRows, { season, timePreset, modes, buckets, sports })
  const { spent, won, roi } = useHeadline(filtered)
  const grouped = useGroupedContests(filtered)
  const { chartData, seriesKeys } = useChartData(filtered, 'mode')
  const topFinishes = useTopFinishes(filtered)
  const biggestWins = useBiggestWins(filtered)

  return (
    <>
      <div className="px-6 bg-background min-h-[calc(100vh-90px)] pt-14 pb-4">
        <div className="flex justify-between items-start">
          <FeatureHeader
            icon={<Banknote size={20} />}
            title="Bankroll Tracker"
            description="Bankroll Tracker is a tool that allows you to track your roi over time."
          />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <UploadCsv file={file} setFile={setFile} onFile={onFile} />
          </div>
        </div>

        {/* Error */}
        {error && <ErrorMessage errorTitle="Error" errorMessage={error} />}

        {/* No data */}
        {baseRows.length === 0 ? (
          <NoData
            title="Upload Data"
            description="Upload your DraftKings contest CSV data to get started."
          />
        ) : (
          <>
            <ContestFilter
              season={season}
              setSeason={setSeason}
              seasons={seasons}
              timePreset={timePreset}
              setTimePreset={setTimePreset}
              modes={modes}
              setModes={setModes}
              buckets={buckets}
              setBuckets={setBuckets}
              sports={sports}
              setSports={setSports}
            />

            <Headline spent={spent} won={won} roi={roi} contests={filtered.length} />

            <div className="flex flex-col max-h-[calc(100vh-460px)] overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                <ProfitChart data={chartData} seriesKeys={seriesKeys} />
                <TopFinishes topFinishes={topFinishes} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 mt-2">
                <AllContests grouped={grouped} onSetSelected={onSetSelected} setOpen={setOpen} />
                <BiggestWins biggestWins={biggestWins} />
              </div>
            </div>
          </>
        )}
      </div>
      <ContestModal open={open} setOpen={setOpen} selected={selected!} />
    </>
  )
}

function UploadCsv({
  file,
  setFile,
  onFile,
}: {
  file: File | null
  setFile: (file: File | null) => void
  onFile: (file: File) => void
}) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-end text-xs text-muted">Last Updated: 9-18-25</div>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
          className="md:text-sm md:leading-7 border border-card rounded w-[250px] h-[40px] pt-1.5 bg-background-darker"
        />
        <Button
          className="btn-accent px-4 rounded disabled:opacity-50"
          onClick={() => file && onFile(file)}
          disabled={!file}
        >
          Save Results
        </Button>
      </div>
    </div>
  )
}
