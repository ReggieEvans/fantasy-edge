import { baseApi } from '../../../../../store/api/baseApi'

export const playersApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getSlatePlayers: build.query<any[], { slateId: string }>({
      query: ({ slateId }) => `/players/${slateId}`,
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
