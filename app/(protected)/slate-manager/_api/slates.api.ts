import { DkSlateSelection } from '@/app/(protected)/slate-manager/_types/dkSlate'
import { baseApi } from '@/store/api/baseApi'

import { Slate } from '../_types/slate'

export const slatesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlates: builder.query<Slate[], void>({
      query: () => '/api/slates',
      providesTags: ['Slates'],
    }),
    addSlate: builder.mutation<void, DkSlateSelection>({
      query: slate => ({
        url: '/api/slates',
        method: 'POST',
        body: slate,
      }),
      invalidatesTags: ['Slates'],
    }),
    deleteSlate: builder.mutation<void, string>({
      query: id => ({
        url: `/api/slates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Slates'],
    }),
  }),
})

export const { useGetSlatesQuery, useAddSlateMutation, useDeleteSlateMutation } = slatesApi
