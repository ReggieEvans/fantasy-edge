import { baseApi } from '@/store/api/baseApi'

export const optimizerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlatePack: builder.query<any, { id: string; gameType: string }>({
      query: ({ id, gameType }) => `/api/slatePack/${id}?gameType=${gameType}`,
      providesTags: ['SlatePack'],
    }),
  }),
})

export const { useGetSlatePackQuery } = optimizerApi
