import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'

interface GameTypeState {
  gameType: 'classic' | 'showdown'
  sport: 'NFL' | 'CFB'
}

const initialState: GameTypeState = {
  gameType: 'classic',
  sport: 'NFL',
}

export const gameTypeSlice = createSlice({
  name: 'gameType',
  initialState,
  reducers: {
    setGameType: (state, action: PayloadAction<GameType>) => {
      return { ...state, gameType: action.payload }
    },
    setSport: (state, action: PayloadAction<Sport>) => {
      return { ...state, sport: action.payload as 'NFL' | 'CFB' }
    },
  },
})

export const { setGameType, setSport } = gameTypeSlice.actions
