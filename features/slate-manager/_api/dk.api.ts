import { baseApi } from '@/store/api/baseApi'

import { DkSlateDTO } from '../_dtos/dkSlate.dto'
import { toDkSlate } from '../_libs/transformers'
import { DkSlateSelection } from '../_types/dkSlate'

export const dkApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getDkSlates: builder.query<DkSlateSelection[], { sport: string; gameType: string }>({
      query: ({ sport, gameType }) => `/api/dkSlates?sport=${sport}&gameType=${gameType}`,
      transformResponse: (res: DkSlateDTO[]) => toDkSlate(res),
      providesTags: ['Slates'],
    }),
  }),
})

export const { useGetDkSlatesQuery } = dkApi
