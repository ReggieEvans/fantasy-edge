import { baseApi } from '@/store/api/baseApi'

import { DkContestsResponseDTO } from '../../_dtos/dkContests.dto'
import { toDkContests } from '../libs/transformers'
import { DkContest } from '../types/ContestTypes'

export const contestSelectionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getContests: builder.query<DkContest[], { sport: string; draftGroupId: number }>({
      query: ({ sport }) => `/api/contest-selection?sport=${sport}`,
      transformResponse: (res: DkContestsResponseDTO, meta, arg) =>
        toDkContests(res, arg.draftGroupId),
      providesTags: ['Contests'],
    }),
  }),
})

export const { useGetContestsQuery } = contestSelectionApi
