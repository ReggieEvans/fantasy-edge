/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from './baseApi'

export const matchupsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMatchups: builder.query<any[], string>({
      query: id => `/api/matchups/${id}`,
      providesTags: ['Matchups'],
    }),
    getMatchup: builder.query<any, { id: string; matchupId: string }>({
      query: ({ id, matchupId }) => `/api/matchups/${id}/${matchupId}`,
      providesTags: ['Matchups'],
    }),
  }),
})

export const { useGetMatchupsQuery, useGetMatchupQuery } = matchupsApi
