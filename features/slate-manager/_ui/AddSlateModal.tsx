'use client'

import { Loader, Plus, Star } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { formatDateTime } from '@/shared/utils'
import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'

import { useGetDkSlatesQuery } from '../_api/dk.api'
import { useAddSlateMutation } from '../_api/slates.api'
import { DkSlateSelection } from '../_types/dkSlate'

export default function AddSlateModal({
  open,
  onClose,
  sport,
  setSport,
  gameType,
  setGameType,
}: {
  open: boolean
  onClose: () => void
  sport: Sport
  setSport: (sport: Sport) => void
  gameType: GameType
  setGameType: (gameType: GameType) => void
}) {
  const [selectedSlateId, setSelectedSlateId] = useState<number | null>(null)
  const { data: slates, isLoading, isFetching } = useGetDkSlatesQuery({ sport, gameType })
  const [addSlate, { isLoading: isAdding }] = useAddSlateMutation()

  const onAddSlate = async (slate: DkSlateSelection) => {
    setSelectedSlateId(slate.draftGroupId)
    const slateToAdd = {
      ...slate,
      sport: sport,
      gameType: gameType,
    }

    try {
      await addSlate(slateToAdd).unwrap()
      toast({
        title: 'Slate Added Successfully! 🔥',
        description: `A new slate has been added to your account.`,
        variant: 'default',
      })
      onClose()
      setSelectedSlateId(null)
    } catch {
      toast({
        title: 'Error Adding Slate',
        description: `There was an error adding the slate to your account.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogDescription className="sr-only">
        {sport} {gameType} Slates
      </DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">
            <div className="flex items-center justify-between gap-2">
              <h2>
                {sport} {gameType} Slates
              </h2>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 px-2">
          <div className="w-[100px]">
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="w-[100px] text-foreground">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary">
                <SelectItem value="NFL">NFL</SelectItem>
                <SelectItem value="CFB">CFB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px] mr-4">
            <Select value={gameType} onValueChange={setGameType}>
              <SelectTrigger className="w-[150px] text-foreground">
                <SelectValue placeholder="Select Game Type" />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary">
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="showdown">Showdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              console.log(slate)
              return (
                <div
                  key={slate.draftGroupId}
                  className="flex justify-between gap-3 items-center bg-background-secondary text-sm p-4 rounded-md border-l-4 border-accent hover:brightness-110 transition-colors duration-300"
                >
                  {isAdding && slate.draftGroupId === selectedSlateId ? (
                    <div className="bg-[rgba(0,0,0,0.2)]">
                      <p>
                        <span className="uppercase font-bold">One moment...</span> We&apos;re adding
                        data to your slate 🔥
                      </p>
                    </div>
                  ) : (
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
                            <div className="uppercase font-bold text-xs">
                              {slate.startTimeSuffix}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="flex items-center gap-1 px-4 btn-accent disabled:opacity-50"
                    onClick={() => onAddSlate(slate)}
                    disabled={isAdding}
                  >
                    {isAdding && slate.draftGroupId === selectedSlateId ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add
                  </button>
                </div>
              )
            })
          ) : (
            <div className="h-full flex flex-col pt-8 items-center">
              <p>No new slates available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
