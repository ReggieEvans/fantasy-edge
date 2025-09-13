import { baseApi } from '@/store/api/baseApi'

import { Roster, RosterView } from '../types/roster'

export const rostersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getRoster: builder.query<RosterView[], { slateId: string }>({
      query: ({ slateId }) => `/api/rosters/${slateId}`,
      providesTags: ['Rosters'],
    }),
    saveRoster: builder.mutation<void, Roster>({
      query: roster => ({
        url: '/api/rosters',
        method: 'POST',
        body: roster,
      }),
      invalidatesTags: ['Rosters'],
    }),
  }),
})

export const { useGetRosterQuery, useSaveRosterMutation } = rostersApi
