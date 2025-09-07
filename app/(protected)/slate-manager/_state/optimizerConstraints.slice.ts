import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ConstraintsState {
  constraints: {
    global_max_exposure: number
  }
}
const initial: ConstraintsState = { constraints: { global_max_exposure: 1 } }

const slice = createSlice({
  name: 'optimizerConstraints',
  initialState: initial,
  reducers: {
    setGlobalMaxExposure: (s, a: PayloadAction<number>) => {
      s.constraints.global_max_exposure = a.payload
    },
  },
})
export const { setGlobalMaxExposure } = slice.actions
export default slice.reducer
