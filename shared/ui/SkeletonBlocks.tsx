import { Skeleton } from '@/components/ui/skeleton'

type SkeletonRowProps = {
  height: number
  width: number
}

export const SkeletonBlocks = ({ height, width }: SkeletonRowProps) => {
  return <Skeleton className={`h-${height} w-${width} bg-card rounded animate-pulse`} />
}
