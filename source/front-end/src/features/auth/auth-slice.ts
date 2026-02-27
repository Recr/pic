import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from './types'

type AuthState = {
  user: User | null
  isAuthInitialized: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthInitialized: false } as AuthState,
  reducers: {
    setCredentials: (state, { payload: { user } }: PayloadAction<{ user: User }>) => {
      state.user = user
    },
    setAuthInitialized: (state, { payload }: PayloadAction<boolean>) => {
      state.isAuthInitialized = payload
    },
    logout: (state) => {
      state.user = null
    },
  },
})

export const { setCredentials, setAuthInitialized, logout } = authSlice.actions
export default authSlice.reducer
