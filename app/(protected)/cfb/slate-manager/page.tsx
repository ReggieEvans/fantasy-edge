'use client'

import { List, Plus } from 'lucide-react'
import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useGetSlatesQuery } from '@/store/api/slatesApi'
import { Slate as SlateType } from '@/types/Slate'

import AddSlateModal from './components/AddSlateModal'
import DeleteSlateModal from './components/DeleteSlateModal'
import Slate from './components/Slate'

export default function SlateManagerPage() {
  const { data: slates, isLoading, isError } = useGetSlatesQuery()
  const [open, setOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [slateToDelete, setSlateToDelete] = useState<SlateType | null>(null)

  if (isError) return <p className="p-4 text-red-500">Failed to load slates.</p>

  const onDeleteSlate = (slate: SlateType) => {
    setSlateToDelete(slate)
    setDeleteModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span>
            <List size={20} />
          </span>
          <h1 className="text-xl font-bold uppercase">Slates</h1>
        </div>
        <div>
          <button className="btn-accent flex items-center gap-2 rounded-full" onClick={() => setOpen(true)}>
            <Plus size={24} /> Add Slate
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-card rounded animate-pulse" />)
        ) : isError ? (
          <p className="text-red-500">Failed to load slates.</p>
        ) : (
          slates?.map((slate: SlateType, i: number) => (
            <Slate
              key={i}
              slate={slate}
              onAddProjections={() => {}}
              onDeleteSlate={onDeleteSlate}
              manageSlate={() => {}}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {open && <AddSlateModal open={open} onClose={() => setOpen(false)} />}
      {slateToDelete && (
        <DeleteSlateModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} slate={slateToDelete} />
      )}
    </div>
  )
}
