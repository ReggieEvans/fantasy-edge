import { Skeleton } from '@/components/ui/skeleton'

import { Slate as SlateType } from '../_types/slate'
import Slate from './Slate'

export default function SlatesList({
  slates = [],
  isLoading = false,
  onDelete,
  onAddProjections,
}: {
  slates?: SlateType[]
  isLoading?: boolean
  onDelete: (s: SlateType) => void
  onAddProjections: (s: SlateType) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full animate-pulse rounded bg-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {slates.map(slate => (
        <Slate
          key={slate.id}
          slate={slate}
          onDeleteSlate={onDelete}
          onAddProjections={onAddProjections}
        />
      ))}
    </div>
  )
}
