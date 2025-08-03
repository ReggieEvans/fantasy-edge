import { DkSlate } from '@/types/DkSlate'
import { Slate } from '@/types/Slate'

import { baseApi } from './baseApi'

export const slatesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSlates: builder.query<Slate[], void>({
      query: () => '/api/slates',
      providesTags: ['Slates'],
    }),
    addSlate: builder.mutation<DkSlate, Partial<DkSlate>>({
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
