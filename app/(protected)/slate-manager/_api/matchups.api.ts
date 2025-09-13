import { baseApi } from '@/store/api/baseApi'

import { MatchupDTO } from '../_dto/matchup.dto'
import { Matchup } from '../_types/matchup'

export const matchupsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMatchups: builder.query<Matchup[], string>({
      query: id => `/api/matchups/${id}`,
      providesTags: ['Matchups'],
    }),
    getMatchup: builder.query<MatchupDTO, { id: string; mid: string }>({
      query: ({ id, mid }) => `/api/matchups/${id}/${mid}`,
      providesTags: ['Matchups'],
    }),
  }),
})

export const { useGetMatchupsQuery, useGetMatchupQuery } = matchupsApi
