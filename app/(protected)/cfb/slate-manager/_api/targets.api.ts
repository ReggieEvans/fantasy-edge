import { baseApi } from '../../../../../store/api/baseApi'
import { Target } from '../_types/target'

export const targetsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTargets: builder.query<Target[], string>({
      query: id => `/api/targets/${id}`,
      providesTags: ['Targets'],
    }),
    addTarget: builder.mutation<Target, Partial<Target>>({
      query: player => ({
        url: '/api/targets',
        method: 'POST',
        body: player,
      }),
      invalidatesTags: ['Targets'],
    }),
    updateTarget: builder.mutation<Target, Partial<Target>>({
      query: payload => ({
        url: '/api/targets',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Targets'],
    }),
    removeTarget: builder.mutation<void, string>({
      query: id => ({
        url: `/api/targets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Targets'],
    }),
  }),
})

export const { useGetTargetsQuery, useAddTargetMutation, useRemoveTargetMutation, useUpdateTargetMutation } = targetsApi
