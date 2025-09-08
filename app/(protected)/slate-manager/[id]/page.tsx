'use client'

import { ArrowLeft, Binoculars } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

import { useGetMatchupsQuery } from '@/app/(protected)/slate-manager/_api/matchups.api'
import { Matchup } from '@/app/(protected)/slate-manager/_types/matchup'
import { Skeleton } from '@/components/ui/skeleton'

import MatchupCard from '../_components/MatchupCard'

export default function MatchupsPage() {
  const { id } = useParams() as { id: string }
  const { data: matchups, isLoading, isError } = useGetMatchupsQuery(id)

  const renderMatchups = () => {
    if (!matchups) return []

    return [...matchups]
      .sort((a, b) => (b.game_total ?? 0) - (a.game_total ?? 0))
      .map((matchup: Matchup) => <MatchupCard key={matchup.id} matchup={matchup} />)
  }

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="text-sm text-accent mb-4">
          <div className="flex items-center gap-2 uppercase font-bold text-xs">
            <ArrowLeft size={16} />
            <Link href="/slate-manager">All Slates</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <Binoculars size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Scouting Matchups</h1>
          </div>
          <p className="text-muted text-sm">
            Choose a game to scout the matchup and target players for your player pool.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-6 py-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {isLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full bg-card rounded animate-pulse" />)
        ) : isError ? (
          // Error state
          <p className="text-red-500">Something went wrong while loading matchups.</p>
        ) : matchups?.length === 0 ? (
          // Empty state
          <p>No matchups found.</p>
        ) : (
          // Success state
          renderMatchups()
        )}
      </div>
    </div>
  )
}
