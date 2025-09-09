import { createSlice, PayloadAction } from '@reduxjs/toolkit'
type Position = 'all' | 'QB' | 'RB' | 'WR' | 'CPT' | 'FLEX'

interface UIState {
  position: Position
  search: string
  hideExcludedInTable: boolean
}
const initial: UIState = { position: 'all', search: '', hideExcludedInTable: false }

const slice = createSlice({
  name: 'optimizerFilters',
  initialState: initial,
  reducers: {
    setPosition: (s, a: PayloadAction<Position>) => {
      s.position = a.payload
    },
    setSearch: (s, a: PayloadAction<string>) => {
      s.search = a.payload
    },
    setHideExcludedInTable: (s, a: PayloadAction<boolean>) => {
      s.hideExcludedInTable = a.payload
    },
    resetFilters: () => initial,
  },
})
export const { setPosition, setSearch, setHideExcludedInTable, resetFilters } = slice.actions
export default slice.reducer
