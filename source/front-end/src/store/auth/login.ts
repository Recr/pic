import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from './auth-slice'
import type { User } from './types'

interface LoginRequest {
  re: number
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

const BASE_URL = import.meta.env.VITE_API_URL

export const loginAPI = createApi({
  reducerPath: 'loginAPI',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
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
