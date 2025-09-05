import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { slateManagerTags } from '@/app/(protected)/slate-manager/_api/baseTags'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: [...slateManagerTags],
  endpoints: () => ({}),
})
