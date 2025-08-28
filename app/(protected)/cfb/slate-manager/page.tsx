'use client'

import { Bolt, Plus } from 'lucide-react'
import { useState } from 'react'

import { useGetSlatesQuery } from '@/app/(protected)/cfb/slate-manager/_api/slates.api'
import { Slate as SlateType } from '@/app/(protected)/cfb/slate-manager/_types/slate'
import { Skeleton } from '@/components/ui/skeleton'

import AddProjectionsModal from './_components/AddProjectionsModal'
import AddSlateModal from './_components/AddSlateModal'
import DeleteSlateModal from './_components/DeleteSlateModal'
import Slate from './_components/Slate'

export default function SlateManagerPage() {
  const { data: slates, isLoading, isError } = useGetSlatesQuery()
  const [open, setOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addProjectionsModalOpen, setAddProjectionsModalOpen] = useState(false)
  const [selectedSlate, setSelectedSlate] = useState<SlateType | null>(null)

  const onDeleteSlate = (slate: SlateType) => {
    setSelectedSlate(slate)
    setDeleteModalOpen(true)
  }

  const onAddProjections = (slate: SlateType) => {
    setSelectedSlate(slate)
    setAddProjectionsModalOpen(true)
  }

  if (isError) return <p className="p-4 text-red-500">Failed to load slates</p>

  return (
    <div className="px-6 bg-background pt-8 min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>
              <Bolt size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Slate Manager</h1>
          </div>
          <p className="text-muted text-sm">
            Scout matchups and target players, refine your player pool, build optimized rosters, and export your final
            lineups — all in one streamlined workflow.
          </p>
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
        ) : slates?.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
            <h2 className="text-muted text-center text-lg font-bold opacity-70">No slates found</h2>
            <p className="text-muted text-center text-sm opacity-50">
              You currently have no slates. You can add slates by clicking the add slate button above.
            </p>
          </div>
        ) : (
          slates?.map((slate: SlateType) => (
            <Slate key={slate.id} slate={slate} onDeleteSlate={onDeleteSlate} onAddProjections={onAddProjections} />
          ))
        )}
      </div>

      {/* Modals */}
      {open && <AddSlateModal open={open} onClose={() => setOpen(false)} />}
      {deleteModalOpen && selectedSlate && (
        <DeleteSlateModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} slate={selectedSlate} />
      )}
      {addProjectionsModalOpen && selectedSlate && (
        <AddProjectionsModal
          open={addProjectionsModalOpen}
          onClose={() => setAddProjectionsModalOpen(false)}
          slate={selectedSlate}
        />
      )}
    </div>
  )
}
