import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ActiveDynasty } from "@/types/activeDynasty";
import { DynastyTeam } from "@/types/dynastyTeam";

type DynastyState = {
  activeDynasty: ActiveDynasty | null;
  userDynastyTeam: DynastyTeam | null;
};

const initialState: DynastyState = {
  activeDynasty: null,
  userDynastyTeam: null,
};

export const dynastySlice = createSlice({
  name: "dynasty",
  initialState,
  reducers: {
    setActiveDynasty(state, action: PayloadAction<ActiveDynasty | null>) {
      state.activeDynasty = action.payload;
    },
    setUserDynastyTeam(state, action: PayloadAction<DynastyTeam | null>) {
      state.userDynastyTeam = action.payload;
    },
  },
});

export const { setActiveDynasty, setUserDynastyTeam } = dynastySlice.actions;
export default dynastySlice.reducer;
