import { baseApi } from '@/store/api/baseApi'

import { Roster } from '../_types/roster'

export const rostersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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

export const { useSaveRosterMutation } = rostersApi
