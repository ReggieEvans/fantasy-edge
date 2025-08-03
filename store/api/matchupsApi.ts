/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi'

export const matchupsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMatchups: builder.query<any[], string>({
      query: id => `/api/matchups/${id}`,
      providesTags: ['Matchups'],
    }),
  }),
})

export const { useGetMatchupsQuery } = matchupsApi
