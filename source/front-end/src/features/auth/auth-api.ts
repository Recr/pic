import { setAuthInitialized, setCredentials } from './auth-slice'
import type { User } from './types'
import { api } from '../../services/api'

interface LoginRequest {
  re: number
  password: string
}

interface LoginResponse {
  user: User
}

export const authAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          setCredentials({
            user: data.user,
          }),
        )
      },
    }),
    getCurrentUser: builder.query<LoginResponse, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            setCredentials({
              user: data.user,
            }),
          )
        } catch (error) {
          console.error('Failed to fetch current user:', error)
        } finally {
          dispatch(setAuthInitialized(true))
        }
      },
    }),
  }),
})
