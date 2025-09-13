'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'

export default function GenerateLineups({
  onGenerateLineups,
  isBusy,
}: {
  onGenerateLineups: (lineups: number) => void
  isBusy: boolean
}) {
  const [lineups, setLineups] = useState(20)

  return (
    <div className="flex gap-4 items-center py-4">
      <button
        className="w-60 btn-accent uppercase font-black"
        onClick={() => onGenerateLineups(lineups)}
        disabled={isBusy}
      >
        {isBusy ? 'Generating...' : 'Generate Lineups'}
      </button>
      <Input
        id="lineups"
        type="number"
        value={lineups}
        onChange={e => setLineups(Number(e.target.value))}
        className="w-20 text-center bg-background-darker border border-accent"
        min={1}
        max={150}
      />
    </div>
  )
}
