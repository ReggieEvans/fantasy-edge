import { baseApi } from '@/store/api/baseApi'

import { Roster, RosterView } from '../_types/roster'
import { RosterType } from '../roster-view/ui/RosterTypeMeta'

export const rostersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getRoster: builder.query<RosterView[], { slateId: string }>({
      query: ({ slateId }) => `/api/rosters/by-slate/${slateId}`,
      providesTags: ['Rosters'],
    }),
    saveRoster: builder.mutation<void, Roster>({
      query: roster => ({
        url: '/api/rosters',
        method: 'POST',
        body: roster,
      }),
      invalidatesTags: ['Rosters', 'Slates'],
    }),
    updateRoster: builder.mutation<
      void,
      {
        rosterId: string
        rosterValues: { name: string | undefined; type: RosterType | null | undefined }
      }
    >({
      query: ({ rosterId, rosterValues }) => ({
        url: `/api/rosters/${rosterId}`,
        method: 'PUT',
        body: { name: rosterValues.name, type: rosterValues.type },
      }),
      invalidatesTags: ['Rosters'],
    }),
    deleteRoster: builder.mutation<void, { rosterId: string }>({
      query: ({ rosterId }) => ({
        url: `/api/rosters/${rosterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rosters', 'Slates'],
    }),
  }),
})

export const {
  useGetRosterQuery,
  useSaveRosterMutation,
  useUpdateRosterMutation,
  useDeleteRosterMutation,
} = rostersApi
