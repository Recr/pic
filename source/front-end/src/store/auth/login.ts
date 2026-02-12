import { setCredentials } from './auth-slice'
import type { User } from './types'
import { api } from '../api'

interface LoginRequest {
  re: number
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

export const loginAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setCredentials({ user: data.user, token: data.token }))
        localStorage.setItem('authToken', data.token)
      },
    }),
  }),
})
