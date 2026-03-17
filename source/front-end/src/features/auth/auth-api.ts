import { logout, setAuthInitialized, setCredentials } from './auth-slice'
import type { ChangePasswordRequest, User } from './types'
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
    getCurrentUser: builder.query<LoginResponse, undefined>({
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
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logout())
        } catch (error) {
          console.error('Failed to logout:', error)
        }
      },
    }),
    changePassword: builder.mutation<undefined, ChangePasswordRequest>({
      query: (changePasswordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: changePasswordData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logout())
        } catch (error) {
          console.error('Failed to logout:', error)
        }
      },
    }),
  }),
})
