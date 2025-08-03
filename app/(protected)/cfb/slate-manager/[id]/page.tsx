'use client'

import { ArrowLeft, Bolt } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

import { useGetMatchupsQuery } from '@/store/api/matchupsApi'
import { Matchup } from '@/types/Matchup'

import MatchupCard from '../components/MatchupCard'

export default function MatchupsPage() {
  const { id } = useParams() as { id: string }
  const { data: matchups, isLoading, isError } = useGetMatchupsQuery(id)

  if (isLoading) return <p className="p-4">Loading slate...</p>
  if (isError) return <p className="p-4 text-red-500">Failed to load slate.</p>
  if (!matchups) return <p className="p-4">No games found.</p>

  return (
    <div className="flex flex-col">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="text-sm text-accent mb-6">
          <div className="flex items-center gap-2 uppercase font-bold text-xs">
            <ArrowLeft size={16} />
            <Link href="/cfb/slate-manager">All Slates</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <Bolt size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Slate Manager</h1>
          </div>
          <p className="text-muted text-sm">
            Choose a slate to get matchup breakdowns, players stats and target players for your player pool.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-8 px-8 py-4">
        {matchups?.map((matchup: Matchup) => <MatchupCard key={matchup.id} matchup={matchup} />)}
      </div>
    </div>
  )
}
