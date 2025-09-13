import { baseApi } from '@/store/api/baseApi'

import { Player } from '../_types/player'

export const playersApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getSlatePlayers: build.query<Player[], { slateId: string }>({
      query: ({ slateId }) => `/api/players/${slateId}/quick-targets`,
    }),

    uploadProjections: build.mutation<
      { updated: number; matched: Array<{ name: string; points: number }>; unmatchedCsv: string[] },
      { slateId: string; csvText: string }
    >({
      query: body => ({
        url: '/api/projections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SlatePlayers', 'Slates'],
    }),
  }),
})

export const { useGetSlatePlayersQuery, useUploadProjectionsMutation } = playersApi
