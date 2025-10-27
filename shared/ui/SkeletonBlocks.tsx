import { Skeleton } from '@/components/ui/skeleton'

type SkeletonRowProps = {
  height: number
  width: number
}

export const SkeletonBlocks = ({ height, width }: SkeletonRowProps) => {
  return (
    <Skeleton
      style={{ height: `${height}px`, width: `${width}px` }}
      className="bg-card border border-card rounded animate-pulse"
    />
  )
}
