import { baseApi } from '../../../../../store/api/baseApi'

export const playersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuickTargets: builder.query<any[], string>({
      query: id => ({
        url: `/api/players/${id}/quick-targets`,
        method: 'GET',
      }),
      providesTags: ['SlatePlayers'],
      keepUnusedDataFor: 0,
    }),
  }),
})

export const { useGetQuickTargetsQuery } = playersApi
