'use client'

import { ArrowLeft, Bolt, Loader } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

import { useGetMatchupsQuery } from '@/app/(protected)/cfb/slate-manager/_api/matchups.api'
import { Matchup } from '@/app/(protected)/cfb/slate-manager/_types/matchup'

import MatchupCard from '../_components/MatchupCard'

export default function MatchupsPage() {
  const { id } = useParams() as { id: string }
  const { data: matchups, isLoading, isError } = useGetMatchupsQuery(id)

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center pt-40 space-y-4">
        <Loader size={40} className="text-accent animate-spin" />
        <p className="text-lg opacity-70">Loading Slates</p>
      </div>
    )
  if (isError) return <p className="p-4 text-red-500">Failed to load slate.</p>
  if (!matchups) return <p className="p-4">No games found.</p>

  return (
    <div className="flex flex-col">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="text-sm text-accent mb-4">
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
            Choose a matchup, target players for your player pool, create rosters, view and export to draftkings.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-8 px-8 py-4">
        {matchups?.map((matchup: Matchup) => <MatchupCard key={matchup.id} matchup={matchup} />)}
      </div>
    </div>
  )
}
