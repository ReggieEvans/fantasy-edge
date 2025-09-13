import { baseApi } from '@/store/api/baseApi'

import { DkSlateSelection } from '../_types/dkSlate'
import { Slate } from '../_types/slate'

export const slatesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlate: builder.query<Slate, string>({
      query: id => `/api/slates/${id}`,
      providesTags: ['Slates'],
    }),
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

export const { useGetSlateQuery, useGetSlatesQuery, useAddSlateMutation, useDeleteSlateMutation } =
  slatesApi
