'use client'

import { ArrowLeft, Bolt } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

import { useGetMatchupsQuery } from '@/app/(protected)/cfb/slate-manager/_api/matchups.api'
import { Matchup } from '@/app/(protected)/cfb/slate-manager/_types/matchup'
import { Skeleton } from '@/components/ui/skeleton'

import MatchupCard from '../_components/MatchupCard'

export default function MatchupsPage() {
  const { id } = useParams() as { id: string }
  const { data: matchups, isLoading, isError } = useGetMatchupsQuery(id)

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
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

      <div className="flex flex-col gap-8 px-6 py-4">
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full bg-card rounded animate-pulse" />)
        ) : isError ? (
          // Error state
          <p className="text-red-500">Something went wrong while loading matchups.</p>
        ) : matchups?.length === 0 ? (
          // Empty state
          <p>No matchups found.</p>
        ) : (
          // Success state
          matchups?.map((matchup: Matchup) => <MatchupCard key={matchup.id} matchup={matchup} />)
        )}
      </div>
    </div>
  )
}
