/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInfiniteQuery } from '@tanstack/react-query'

type PlayersResponse = {
  items: any[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export function useSlatePlayers({
  slateId,
  q,
  position,
}: {
  slateId: string
  q: string
  position: string
}) {
  return useInfiniteQuery({
    queryKey: ['slatePlayers', slateId, q, position],
    queryFn: async ({ pageParam = 1 }): Promise<PlayersResponse> => {
      const params = new URLSearchParams({
        page: String(pageParam),
        pageSize: '100',
      })
      if (q) params.set('q', q)
      const positionParam = position === 'all' ? '' : position
      params.set('position', positionParam)

      const res = await fetch(`/api/players/${slateId}/quick-targets?` + params.toString())
      if (!res.ok) throw new Error('Failed to fetch players')
      return res.json()
    },
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    initialPageParam: 1,
  })
}
