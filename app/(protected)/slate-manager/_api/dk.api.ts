import { baseApi } from '@/store/api/baseApi'

import { DkSlateDTO } from '../_dto/dkSlate.dto'
import { toDkSlate } from '../_lib/transformers'
import { DkSlateSelection } from '../_types/dkSlate'

export const dkApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getDkSlates: builder.query<DkSlateSelection[], void>({
      query: () => '/api/dkSlates',
      transformResponse: (res: DkSlateDTO[]) => toDkSlate(res),
      providesTags: ['Slates'],
    }),
  }),
})

export const { useGetDkSlatesQuery } = dkApi
