'use client'

import { ArrowLeft, Binoculars } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import FeatureHeader from '@/shared/ui/FeatureHeader'
import { NoData } from '@/shared/ui/NoData'
import { SkeletonRows } from '@/shared/ui/SkeletonRows'

import { useGetMatchupsQuery } from '../../scouting/api/matchups.api'
import { Matchup } from '../types/matchup'
import MatchupCard from '../ui/MatchupCard'

export default function MatchupsPage() {
  const { id } = useParams() as { id: string }
  const { data: matchups, isLoading, isError } = useGetMatchupsQuery(id)

  const sortedMatchups = useMemo<Matchup[]>(
    () => (matchups ?? []).slice().sort((a, b) => (b.game_total ?? 0) - (a.game_total ?? 0)),
    [matchups],
  )

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="text-sm text-accent mb-4">
          <div className="flex items-center gap-2 uppercase font-bold text-xs">
            <ArrowLeft size={16} aria-hidden />
            <Link href="/slate-manager">All Slates</Link>
          </div>
        </div>

        <FeatureHeader
          icon={<Binoculars size={20} />}
          title="Scouting Matchups"
          description="Choose a game to scout the matchup and target players for your player pool."
        />
      </div>

      <div className="flex flex-col gap-8 px-6 py-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {isLoading && (
          <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRows key={i} height={48} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <ErrorMessage
            errorMessage="Something went wrong while loading matchups."
            errorTitle="Error"
          />
        )}

        {!isLoading && !isError && sortedMatchups.length === 0 && (
          <NoData title="No matchups found." description="No matchups found for this slate." />
        )}

        {!isLoading && !isError && sortedMatchups.map(m => <MatchupCard key={m.id} matchup={m} />)}
      </div>
    </div>
  )
}
