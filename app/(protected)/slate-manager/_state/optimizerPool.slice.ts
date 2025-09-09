import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PoolState {
  excludedTeamIds: string[] // store as strings for stable Set compares
  excludedPlayerIds: string[]
  lockedPlayerIds: string[]
}
const initial: PoolState = { excludedTeamIds: [], excludedPlayerIds: [], lockedPlayerIds: [] }

const slice = createSlice({
  name: 'optimizerPool',
  initialState: initial,
  reducers: {
    excludeTeam: (s, a: PayloadAction<string>) => {
      if (!s.excludedTeamIds.includes(a.payload)) s.excludedTeamIds.push(a.payload)
    },
    includeTeam: (s, a: PayloadAction<string>) => {
      s.excludedTeamIds = s.excludedTeamIds.filter(id => id !== a.payload)
    },

    excludePlayer: (s, a: PayloadAction<string>) => {
      if (!s.excludedPlayerIds.includes(a.payload)) s.excludedPlayerIds.push(a.payload)
    },
    includePlayer: (s, a: PayloadAction<string>) => {
      s.excludedPlayerIds = s.excludedPlayerIds.filter(id => id !== a.payload)
    },

    lockPlayer: (s, a: PayloadAction<string>) => {
      if (!s.lockedPlayerIds.includes(a.payload)) s.lockedPlayerIds.push(a.payload)
    },
    unlockPlayer: (s, a: PayloadAction<string>) => {
      s.lockedPlayerIds = s.lockedPlayerIds.filter(id => id !== a.payload)
    },
    toggleExcludePlayersSubset: (s, action: PayloadAction<string[]>) => {
      const subset = action.payload.map(String)
      const set = new Set(s.excludedPlayerIds.map(String))

      const allSubsetAlreadyExcluded = subset.every(id => set.has(id))

      if (allSubsetAlreadyExcluded) {
        // UN-exclude just this subset
        subset.forEach(id => set.delete(id))
      } else {
        // Exclude this subset, keep previous excludes
        subset.forEach(id => set.add(id))
      }

      s.excludedPlayerIds = Array.from(set)
      // s.lockedPlayerIds = [] // optional, if you want to clear locks when excluding
    },
    resetPool: () => initial,
  },
})
export const {
  excludeTeam,
  includeTeam,
  excludePlayer,
  includePlayer,
  lockPlayer,
  unlockPlayer,
  toggleExcludePlayersSubset,
  resetPool,
} = slice.actions
export default slice.reducer
