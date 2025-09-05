import { baseApi } from '@/store/api/baseApi'

export const optimizerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlatePack: builder.query<any, string>({
      query: id => `/api/slatePack/${id}`,
      providesTags: ['SlatePack'],
    }),
  }),
})

export const { useGetSlatePackQuery } = optimizerApi
