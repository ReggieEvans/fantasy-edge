import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { createClient } from '@/libs/supabase/client'

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getUserProfile: builder.query({
      queryFn: async () => {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          return { error: { message: 'No access token' } }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${session.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
          },
        )

        if (!res.ok) {
          return { error: { message: `Request failed: ${res.statusText}` } }
        }

        const [data] = await res.json()
        return { data }
      },
    }),
  }),
})

export const { useGetUserProfileQuery } = profileApi
