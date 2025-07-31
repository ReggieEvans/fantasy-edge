import { ActiveDynasty } from "@/types/activeDynasty";
import { DynastyTeam } from "@/types/dynastyTeam";
import { createClient } from "@/libs/supabase/client";

import { setActiveDynasty, setUserDynastyTeam } from "../slices/dynastySlice";
import { baseApi } from "./baseApi";

export const dynastyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveDynasty: builder.query<ActiveDynasty | null, void>({
      query: () => "dynasty/active",
      providesTags: [{ type: "Dynasty", id: "LIST" }],

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setActiveDynasty(data));
          }
        } catch (err) {
          console.error("Failed to load active dynasty", err);
        }
      },
    }),
    getUserTeamByDynastyId: builder.query<DynastyTeam, string>({
      queryFn: async (dynastyId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("dynasty_id", dynastyId)
          .eq("is_user_team", true)
          .single();

        if (error) return { error: { status: 500, data: error.message } };
        return { data };
      },
      providesTags: [{ type: "Dynasty", id: "LIST" }],
      async onQueryStarted(dynastyId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setUserDynastyTeam(data));
          }
        } catch (err) {
          console.error("Failed to load user team", err);
        }
      },
    }),
    createDynasty: builder.mutation<
      string,
      {
        userId: string;
        dynastyName: string;
        typeId: number;
        baseTeamId: string;
        startYear: number;
      }
    >({
      queryFn: async ({
        userId,
        dynastyName,
        typeId,
        baseTeamId,
        startYear,
      }) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("create_dynasty_full", {
          p_user_id: userId,
          p_dynasty_name: dynastyName,
          p_dynasty_type_id: typeId,
          p_base_team_id: baseTeamId,
          p_start_year: startYear,
        });

        if (error) {
          return { error: { status: 500, data: error.message } };
        }

        return { data };
      },
      invalidatesTags: [{ type: "Dynasty", id: "LIST" }],
    }),
  }),
});

export const {
  useGetActiveDynastyQuery,
  useCreateDynastyMutation,
  useGetUserTeamByDynastyIdQuery,
} = dynastyApi;
