import { baseApi } from '@/store/api/baseApi'

import { toPlayerNews } from '../lib/toPlayerNews'

export const playerNewsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPlayerNews: builder.query<any[], { sport: string }>({
      query: ({ sport }) => `/api/playerNews?sport=${sport}`,
      transformResponse: (res: any[]) => toPlayerNews(res),
      providesTags: ['PlayerNews'],
    }),
  }),
})

export const { useGetPlayerNewsQuery } = playerNewsApi
