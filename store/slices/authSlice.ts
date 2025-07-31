import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  id: string | null
  email: string | null
  user_name: string | null
  role: string | null
  hasCreatedDynasty: boolean
}

const initialState: AuthState = {
  id: null,
  email: null,
  user_name: '',
  role: null,
  hasCreatedDynasty: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload }
    },
    clearAuth: () => initialState,
  },
})

export const { setAuth, clearAuth } = authSlice.actions
