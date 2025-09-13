'use client'

import { ClipboardCheck } from 'lucide-react'
import { useParams } from 'next/navigation'

import { SkeletonBlocks } from '@/shared/ui/SkeletonBlocks'

import { useGetRosterQuery } from '../../_api/roster.api'
import { useGetSlateQuery } from '../../_api/slates.api'
import { RosterSlot, RosterView } from '../../_types/roster'
import { RosterItem } from '../ui/RosterItem'

type Sport = 'NFL' | 'CFB'

export default function RosterViewPage() {
  const { id } = useParams() as { id: string }
  const { data: slate } = useGetSlateQuery(id)
  const { data: rosters = [], isLoading } = useGetRosterQuery({ slateId: id })

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <ClipboardCheck size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Roster Export</h1>
          </div>
          <p className="text-muted text-sm">
            The player pool is a list of players that you have targeted for your slate. From here
            you can filter, sort, edit and delete targets in your pool.
          </p>
        </div>
      </div>

      {/* Render groups */}
      <div className="space-y-4 px-6">
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonBlocks key={i} height={600} width={500} />
            ))}
          </div>
        ) : rosters?.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
            <h2 className="text-muted text-center text-lg font-bold opacity-70">
              No Rosters found
            </h2>
            <p className="text-muted text-center text-sm opacity-50">
              You currently have no rosters for this slate. You can create a roster by selecting the
              build button in the side navigation.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {rosters.map((roster: RosterView) => {
              const totalProjections = roster.roster_players.reduce(
                (acc: number, player: RosterSlot) => acc + (player.projection ?? 0),
                0,
              )
              return (
                <div key={roster.id} className="mb-6 w-[500px]">
                  <div className="flex items-center justify-between text-sm font-black text-foreground uppercase border-b border-accent py-3 px-6 bg-card rounded-t">
                    <p>{roster.name ? roster.name : 'Unnamed Roster'}</p>
                    <p className="text-muted text-xs">TYPE: {roster.type ? roster.type : 'N/A'}</p>
                  </div>
                  <div className="flex flex-col">
                    {roster.roster_players.map((player: RosterSlot) => (
                      <RosterItem key={player.id} player={player} sport={slate?.sport as Sport} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-foreground px-6 py-3 bg-card rounded-b border-t border-border">
                    <p>Total Salary: ${roster.total_salary.toLocaleString('en-US')}</p>
                    <p>Projections: {totalProjections.toFixed(1)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
