'use client'

import { Loader, Sparkles, Upload } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'

import { Lineup } from '../types/LineupType'

export default function GenerateLineups({
  onGenerateLineups,
  isBusy,
  isExporting,
  onExportLineups,
  lineups,
}: {
  onGenerateLineups: (lineups: number) => void
  isBusy: boolean
  isExporting: boolean
  onExportLineups: () => void
  lineups: Lineup[] | undefined
}) {
  const [lineupCount, setLineupCount] = useState(20)

  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex gap-4 items-center">
        <button
          className="w-60 btn-accent uppercase font-black"
          onClick={() => onGenerateLineups(lineupCount)}
          disabled={isBusy}
        >
          <div className="flex items-center justify-center gap-2">
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader size={14} className="mb-0.5 animate-spin" /> Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="mb-0.5" /> Generate Lineups
              </span>
            )}
          </div>
        </button>
        <Input
          id="lineups"
          type="number"
          value={lineupCount}
          onChange={e => setLineupCount(Number(e.target.value))}
          className="w-20 text-center bg-background-darker border border-accent"
          min={1}
          max={150}
        />
      </div>
      <button
        className="btn-accent uppercase font-black disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => onExportLineups()}
        disabled={isExporting || (lineups && lineups.length === 0)}
      >
        <div className="flex items-center justify-center gap-2">
          {isExporting ? (
            <span className="flex items-center gap-2">
              <Loader size={14} className="mb-1 animate-spin" /> Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload size={14} className="mb-1" /> Export Lineups
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
