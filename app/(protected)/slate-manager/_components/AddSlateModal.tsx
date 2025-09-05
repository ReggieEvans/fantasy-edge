'use client'

import { Loader, Plus, Star } from 'lucide-react'
import { useState } from 'react'

import { useAddSlateMutation } from '@/app/(protected)/slate-manager/_api/slates.api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

import { useGetDkSlatesQuery } from '../_api/dk.api'
import { DkSlateSelection } from '../_types/dkSlate'

export default function AddSlateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedSlateId, setSelectedSlateId] = useState<number | null>(null)
  const { data: slates, isLoading } = useGetDkSlatesQuery()
  const [addSlate, { isLoading: isAdding }] = useAddSlateMutation()

  const onAddSlate = async (slate: DkSlateSelection) => {
    setSelectedSlateId(slate.draftGroupId)
    try {
      await addSlate(slate).unwrap()
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
      <DialogDescription className="sr-only">Add Available Slate</DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Add Available Slate</DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] overflow-y-auto py-2 px-3 space-y-2 relative">
          {isLoading ? (
            <div className="h-full flex flex-col pt-8 items-center">
              <div className="mb-4">
                <Loader size={24} className="animate-spin" />
              </div>
              <p>Loading Draftkings slates...</p>
            </div>
          ) : slates && slates.length > 0 ? (
            slates.map((slate: DkSlateSelection) => (
              <div
                key={slate.draftGroupId}
                className="flex justify-between gap-3 items-center bg-background-secondary text-sm p-4 rounded-md border-l-4 border-accent hover:brightness-110 transition-colors duration-300"
              >
                {isAdding && slate.draftGroupId === selectedSlateId ? (
                  <div className="bg-[rgba(0,0,0,0.2)]">
                    <p>
                      <span className="uppercase font-bold">One moment...</span> We&apos;re adding data to your slate 🔥
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
                      <div className="text-xs font-bold uppercase text-muted">{slate.leagues?.[0].leagueName}</div>
                      <div className="flex w-full justify-between items-center">
                        <div>{new Date(slate.minStartTime).toLocaleString()}</div>
                        <div className="uppercase font-bold text-xs">{slate.games.length} games</div>
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
            ))
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
