import { Loader, Star } from 'lucide-react'
import { useState } from 'react'

import { useGetDkSlatesQuery } from '@/features/slate-manager/_api/dk.api'
import { DkSlateSelection } from '@/features/slate-manager/_types/dkSlate'
import { formatDateTime } from '@/shared/utils'
import { GameType } from '@/types/gameType'

export default function UpcomingSlates({ sport }: { sport: 'NFL' | 'CFB' }) {
  const [gameType] = useState<GameType>('classic')
  const { data: slates, isLoading, isFetching } = useGetDkSlatesQuery({ sport, gameType })

  return (
    <div className=" bg-background-secondary rounded border border-muted-bg h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-accent">
        <h2 className="text-lg font-bold text-foreground ">Upcoming Slates</h2>
      </div>

      <div className="py-2 px-3 space-y-2 relative h-[400px] max-h-[400px] overflow-y-auto">
        {isLoading || isFetching ? (
          <div className="h-full flex flex-col pt-8 items-center">
            <div className="mb-4">
              <Loader size={24} className="animate-spin" />
            </div>
            <p>Loading Draftkings slates...</p>
          </div>
        ) : slates && slates.length > 0 ? (
          slates.map((slate: DkSlateSelection) => {
            return (
              <div
                key={slate.draftGroupId}
                className="
                    flex justify-between gap-3 items-center bg-background-secondary 
                    border-b border-muted-bg text-sm p-4 rounded-md hover:brightness-110 
                    transition-colors duration-300
                "
              >
                <div className="flex items-center gap-3 w-full">
                  <div>
                    {slate.allTags.includes('Featured') ? (
                      <Star size={20} className="text-accent" fill="currentColor" />
                    ) : (
                      <Star size={20} className="text-muted" />
                    )}
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between w-full text-sm font-bold text-foreground">
                      <span className="uppercase">
                        {slate.sport} {formatDateTime(slate.minStartTime)}
                      </span>{' '}
                      <span className="text-muted text-xs mr-2">{slate.startTimeSuffix}</span>
                    </div>
                    <div className="flex w-full justify-between items-center text-muted">
                      {gameType === 'showdown' ? (
                        <div className="uppercase font-bold text-xs">Showdown Slate</div>
                      ) : (
                        <div className="uppercase font-bold text-xs">
                          {slate.games.length} Game Slate
                        </div>
                      )}
                      {gameType === 'showdown' && (
                        <div className="uppercase font-bold text-xs">{slate.startTimeSuffix}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-full flex flex-col pt-8 items-center">
            <p>No new slates available</p>
          </div>
        )}
      </div>
    </div>
  )
}
