import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OptimizerConstraints } from '../[id]/optimizer/types'

interface ConstraintsState {
  constraints: OptimizerConstraints
}
const initial: ConstraintsState = {
  constraints: {
    n_lineups: 20,
    unique_players_per_lineup: 1,
    global_max_exposure: 1,
  },
}

const slice = createSlice({
  name: 'optimizerConstraints',
  initialState: initial,
  reducers: {
    setGlobalMaxExposure: (s, a: PayloadAction<number>) => {
      s.constraints.global_max_exposure = a.payload
    },
    setConstraints: (s, a: PayloadAction<OptimizerConstraints>) => {
      s.constraints = a.payload
    },
  },
})
export const { setGlobalMaxExposure, setConstraints } = slice.actions
export default slice.reducer
