'use client'

import { Loader, Plus } from 'lucide-react'

import { useAddSlateMutation } from '@/app/(protected)/cfb/slate-manager/_api/slates.api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

import { useGetDkSlatesQuery } from '../_api/dk.api'
import { DkSlateSelection } from '../_types/dkSlate'

export default function AddSlateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: slates, isLoading } = useGetDkSlatesQuery()
  const [addSlate, { isLoading: isAdding }] = useAddSlateMutation()

  const onAddSlate = async (slate: DkSlateSelection) => {
    try {
      await addSlate(slate).unwrap()
      toast({
        title: 'Slate Added Successfully! 🔥',
        description: `A new slate has been added to your account.`,
        variant: 'default',
      })
      onClose()
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
        Add Available Slate
      </DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Add Available Slate</DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] overflow-y-auto py-2 px-3">
          {isLoading ? (
            <div className="h-full flex flex-col pt-8 items-center">
              <div className="mb-4">
                <Loader size={24} className="animate-spin" />
              </div>
              <p>Loading Draftkings slates...</p>
            </div>
          ) : slates ? (
            slates.map((slate: DkSlateSelection) => (
              <div
                key={slate.draftGroupId}
                className="flex justify-between items-center bg-background-secondary text-sm p-4 rounded-md border-l-4 border-accent hover:brightness-110 transition-colors duration-300"
              >
                <div>
                  {slate.sport} — {'Classic'} —{' '}
                  {new Date(slate.minStartTime).toLocaleString()}
                </div>
                <button
                  className="flex items-center gap-1 px-4 btn-accent"
                  onClick={() => onAddSlate(slate)}
                  disabled={isAdding}
                >
                  {isAdding ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col pt-8 items-center">
              <p>No slates available</p>
            </div>
          )}

          {isAdding && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px]">
              <p className="uppercase font-bold">One moment</p>
              <p className="opacity-70 text-sm">We&apos;re adding data to your slates.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
