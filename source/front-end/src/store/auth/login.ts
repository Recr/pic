import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface LoginRequest {
  re: string
  password: string
}

interface LoginResponse {
  token: string
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
    }),
  }),
})
