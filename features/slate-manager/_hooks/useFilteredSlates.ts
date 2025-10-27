import { useGetSlatesQuery } from '@/features/slate-manager/_api/slates.api'
import { Slate as SlateType } from '@/features/slate-manager/_types/slate'
import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'

export function useFilteredSlates({ sport, gameType }: { sport: Sport; gameType: GameType }) {
  const q = useGetSlatesQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => ({
      isLoading,
      isError,
      slates: (data ?? []).filter((s: SlateType) => s.sport === sport && s.game_type === gameType),
    }),
  })
  return q
}
