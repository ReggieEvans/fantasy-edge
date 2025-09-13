import { memo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export const PlayerTableSkeleton = memo(() => (
  <div className="w-full overflow-x-auto">
    <div className="mt-4 max-h-[800px] overflow-y-auto relative">
      <div className="min-w-max border-separate border-spacing-0">
        {/* Header skeleton */}
        <div className="text-xs text-muted font-bold sticky top-0 z-20 bg-background-secondary border-b">
          <div className="h-10 flex items-center px-4">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Body skeleton */}
        <div className="bg-card">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`sk-${i}`} className="flex items-center h-12 px-4 border-b border-background-darker">
              <div className="flex gap-4 w-full">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
))

PlayerTableSkeleton.displayName = 'PlayerTableSkeleton'
