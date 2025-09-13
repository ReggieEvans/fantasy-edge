import { Skeleton } from '@/components/ui/skeleton'

type SkeletonRowProps = {
  height: number
}

export const SkeletonRows = ({ height }: SkeletonRowProps) => {
  return <Skeleton className={`h-${height} w-full bg-card rounded animate-pulse`} />
}
