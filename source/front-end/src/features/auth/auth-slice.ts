import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from './types'

type AuthState = {
  user: User | null
  token: string | null
}

const storedToken = localStorage.getItem('authToken')

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: storedToken } as AuthState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = user
      state.token = token
      localStorage.setItem('authToken', token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('authToken')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
