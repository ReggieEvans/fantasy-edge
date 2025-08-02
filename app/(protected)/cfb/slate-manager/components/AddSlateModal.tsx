/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Loader, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import rawSlate from '@/data/demodkslate.json' assert { type: 'json' }
import { toast } from '@/hooks/use-toast'
import { useAddSlateMutation } from '@/store/api/slatesApi'
import { DkSlate } from '@/types/DkSlate'

interface DemoSlate {
  draftGroup: {
    draftGroupId: number
    games: any[]
    teams: any[]
    minStartTime: string
    maxStartTime: string
  }
  players: any[]
}

export default function AddSlateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const demoSlate = rawSlate as DemoSlate[]
  const [loading, setLoading] = useState(true)
  const [addSlate, { isLoading: isAdding }] = useAddSlateMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const onAddSlate = async (slate: DkSlate) => {
    console.log(slate)
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
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Add Available Slate</DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] overflow-y-auto py-2 px-3">
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <Loader size={16} className="animate-spin" />
            </div>
          ) : (
            demoSlate.map((slate: any) => (
              <div
                key={slate.draftGroup.draftGroupId}
                className="flex justify-between items-center bg-background-secondary text-sm p-4 rounded-md border-l-4 border-accent"
              >
                <div>
                  {slate.draftGroup.contestType.sport} — {slate.gameType} —{' '}
                  {new Date(slate.draftGroup.minStartTime).toLocaleString()}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
