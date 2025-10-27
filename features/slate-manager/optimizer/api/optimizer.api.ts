import { baseApi } from '@/store/api/baseApi'

import { SlatePack } from '../types/SlatePack'

export const optimizerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlatePack: builder.query<SlatePack, { id: string; gameType: string }>({
      query: ({ id, gameType }) => `/api/slatePack/${id}?gameType=${gameType}`,
      providesTags: ['SlatePack'],
    }),
  }),
})

export const { useGetSlatePackQuery } = optimizerApi
