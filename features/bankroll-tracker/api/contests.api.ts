import { baseApi } from '@/store/api/baseApi'

import { DbRow, organizeContestEntries } from '../helpers/organizeContestEntries'
import { Row } from '../types/row'

type AllResp = { rows: DbRow[]; total: number; last_updated: string }
type OrganizedResp = { rows: Row[]; total: number; last_updated: string | null }

export const contestsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getContestEntries: builder.query<OrganizedResp, void>({
      query: () => {
        return {
          url: '/api/bankroll-tracker',
          method: 'GET',
        }
      },
      transformResponse: (resp: AllResp): OrganizedResp => ({
        rows: organizeContestEntries(resp.rows),
        total: resp.total,
        last_updated: resp.last_updated,
      }),
      providesTags: ['ContestEntries'],
    }),
    uploadContestEntries: builder.mutation<{ ok: boolean; inserted: number }, File>({
      query: file => {
        const fd = new FormData()
        fd.append('file', file)
        return {
          url: '/api/bankroll-tracker',
          method: 'POST',
          body: fd,
        }
      },
      invalidatesTags: ['ContestEntries'],
    }),
  }),
})

export const { useUploadContestEntriesMutation, useGetContestEntriesQuery } = contestsApi
