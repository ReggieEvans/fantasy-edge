import { baseApi } from '../../../../../store/api/baseApi'
import { TargetPool } from '../_types/targetPool'

export const targetPoolApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTargetPool: builder.query<TargetPool[], string>({
      query: id => `/api/targets/pool/${id}`,
      providesTags: ['Targets'],
    }),
  }),
})

export const { useGetTargetPoolQuery } = targetPoolApi
