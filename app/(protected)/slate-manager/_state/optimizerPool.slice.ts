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
    toggleExcludeAllPlayers: (s, action: PayloadAction<string[]>) => {
      const allIds = action.payload.map(String)
      const currentSet = new Set(s.excludedPlayerIds.map(String))

      const allAreExcluded = allIds.every(id => currentSet.has(id))

      if (allAreExcluded) {
        // 👇 All were already excluded → include all
        s.excludedPlayerIds = []
      } else {
        // 👇 Not all excluded → exclude all
        s.excludedPlayerIds = allIds
        s.lockedPlayerIds = [] // optional
      }
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
  toggleExcludeAllPlayers,
  resetPool,
} = slice.actions
export default slice.reducer
